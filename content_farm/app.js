const googleTrends = require("google-trends-api");
const { createApolloFetch } = require("apollo-fetch");
const fetch2 = require("node-fetch");
var CronJob = require("cron").CronJob;

const fetch = createApolloFetch({
    uri: "https://dev-api.aivo.ai/graphql",
});

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function getAivoLoginToken() {
    const res = await fetch({
        query: `mutation{
            login(data:{
              email:"mike@aivo.ai",
              password:"aA26761683"
            }){
              token
            }
          }`,
    });
    // console.log(res.data.login.token);
    return res.data.login.token;
}

// this function return the video ID on aivo along with video topic
function upsertVideoWithUrl(inputUrl, token) {
    let variables = { url: inputUrl };
    console.log("line 28", variables);
    fetch.use(({ request, options }, next) => {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers["authorization"] = token;
        next();
    });

    try {
        const res = fetch({
            query: `mutation upsertVideo($url: String!){
            upsertVideo (data:{
                create:{
                urlInput: {url: $url}
            }
            }){
                id
            }
          }`,
            variables: variables,
            options: {
                headers: {
                    authorization: token,
                },
            },
        });
    } catch (e) {
        console.error(e);
    }
}

async function renderAndUploadYoutube(id, title, token) {
    fetch.use(({ request, options }, next) => {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers["authorization"] = token;
        next();
    });

    try {
        const res = await fetch2(
            "https://oauth2.googleapis.com/token?grant_type=refresh_token&refresh_token=1//04OFK9Tgr4kJACgYIARAAGAQSNwF-L9IrzT74a4PLdOglNZBTaVsmkLH4UhTGbVyuxVR2Fs4BNoG_YVC5G53x3YUWvfRhE6Np4v0&client_id=1095701366809-kiea0c7mribb8f85a97gh68nsng0p9fv.apps.googleusercontent.com&client_secret=6MZNGO6t2HWfT7gQ32YFA3ss",
            { method: "POST" }
        );
        const { access_token } = await res.json();
        console.log("access token😎 :", access_token);

        await fetch({
            query: `mutation updateYoutubeToken ($data: String!){
                updateYoutubeToken(data: $data)
            }`,
            variables: {
                data: access_token,
            },
            options: {
                headers: {
                    authorization: token,
                },
            },
        });

        const resUpYoutube = await fetch({
            query: `mutation upsertVideo(
                $id: UUID!
            $title: String!
            $privacyStatus: String!){
          upsertVideo (data: {
                update: {
                  where: { id: $id }
                  data: {
                    isDownloaded: true
                    youtubeShareData: {
                      title: $title
                      privacyStatus: $privacyStatus
                    }
                  }
                }
              }){
            id
          }
        }`,
            variables: {
                id: id,
                title: title,
                privacyStatus: "public",
            },
            options: {
                headers: {
                    authorization: token,
                },
            },
        });
        console.log(resUpYoutube);
    } catch (e) {
        console.error(e);
    }
}

async function getGoogleTrends() {
    var rst = [];
    const token = await getAivoLoginToken();
    googleTrends.dailyTrends(
        {
            trendDate: new Date(),
            geo: "US",
        },
        async function (err, results) {
            if (err) {
                console.log("oh no error!", err);
            } else {
                let data;
                data = JSON.parse(results).default.trendingSearchesDays[0]
                    .trendingSearches;

                // console.log("number of trending words: "+ data.length)
                data.map((trend) => {
                    rst.push({
                        title: trend.articles[0].title,
                        url: trend.articles[0].url,
                    });
                });

                for (let i = 0; i < 5; i++) {
                    console.log(rst[i]);
                    upsertVideoWithUrl(rst[i].url, token);
                    await sleep(60000);
                }
            }
        }
    );
}

async function test() {
    const token = await getAivoLoginToken();
    const vidID = await upsertVideoWithUrl("http://www.google.com", token);
    console.log(vidID);
    renderAndUploadYoutube(vidID, "gogole", token);
}

// const token = fetch2('https://oauth2.googleapis.com/token?grant_type=refresh_token&refresh_token=1//04GX8gpfq1eLWCgYIARAAGAQSNwF-L9Irp80V5GpzUsvPc54GIK9sPk58mih_3bGO8JW5PP1HtiOUV1PEdJNnC12fg3Bd0PBYQtc&client_id=1095701366809-kiea0c7mribb8f85a97gh68nsng0p9fv.apps.googleusercontent.com&client_secret=6MZNGO6t2HWfT7gQ32YFA3ss',
// {method:'POST'}).then(res=>res.json()).then(({access_token})=>{
//     console.log(access_token)
// })

// getGoogleTrends()
// test()

async function getInProgressVideos(token) {
    fetch.use(async ({ request, options }, next) => {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers["authorization"] = token;
        next();
    });
    const res = await fetch({
        query: `query getInProgress {
            me {
              videos(where: { isDownloaded: false, isDeleted: false }, orderBy: updatedAt_DESC) {
                id
                createdAt
                title
              }
            }
          }`,
        options: {
            headers: {
                authorization: token,
            },
        },
    });
    return res.data.me.videos;
}

async function renderVidsfromDB(token) {
    let inProgrssVidIDs = await getInProgressVideos(token);
    if (inProgrssVidIDs.length == 0) {
        console.log("no in progress vid");
        return;
    }
    console.log(inProgrssVidIDs);

    fetch.use(({ request, options }, next) => {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers["authorization"] = token;
        next();
    });

    try {
        const res = await fetch2(
            "https://oauth2.googleapis.com/token?grant_type=refresh_token&refresh_token=1//04OFK9Tgr4kJACgYIARAAGAQSNwF-L9IrzT74a4PLdOglNZBTaVsmkLH4UhTGbVyuxVR2Fs4BNoG_YVC5G53x3YUWvfRhE6Np4v0&client_id=1095701366809-kiea0c7mribb8f85a97gh68nsng0p9fv.apps.googleusercontent.com&client_secret=6MZNGO6t2HWfT7gQ32YFA3ss",
            { method: "POST" }
        );
        const { access_token } = await res.json();
        console.log("access token😎 :", access_token);
        await fetch({
            query: `mutation updateYoutubeToken ($data: String!){
                updateYoutubeToken(data: $data)
            }`,
            variables: {
                data: access_token,
            },
            options: {
                headers: {
                    authorization: token,
                },
            },
        });

        fetch({
            query: `mutation upsertVideo(
                    $id: UUID!
                $title: String!
                $privacyStatus: String!){
              upsertVideo (data: {
                    update: {
                      where: { id: $id }
                      data: {
                        isDownloaded: true
                        youtubeShareData: {
                          title: $title
                          privacyStatus: $privacyStatus
                        }
                      }
                    }
                  }){
                id
              }
            }`,
            variables: {
                id: inProgrssVidIDs[0].id,
                title: inProgrssVidIDs[0].title,
                privacyStatus: "public",
            },
            options: {
                headers: {
                    authorization: token,
                },
            },
        }).catch((err) => {
            console.error(err);
        });
    } catch (e) {
        console.error(e);
    }
}

async function run() {

    const token = await getAivoLoginToken()
    console.log(token)
    fetch.use(({ request, options }, next) => {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers["authorization"] = token;
        next();
    });

    await fetch({
        query: `mutation updateYoutubeToken ($data: String!){
            updateYoutubeToken(data: $data){
                youtubeToken
            }
        }`,
        variables: {
            data: "ffffff",
        },
        options: {
            headers: {
                authorization: token,
            },
        },
    });
}
run();
// getGoogleTrends()

// var getTrendsJob = new CronJob(
//     "0 22 * * 1-5",
//     function () {
//         console.log("getGoogleTrends");
//         getGoogleTrends();
//     },
//     null,
//     true,
//     "America/Los_Angeles"
// );
// var renderFromDBJob = new CronJob(
//     "0 10-20 * * 1-5",
//     async function () {
//         console.log("check in progress vid in DB and render 1 vid every hour");
//         let token = await getAivoLoginToken();
//         renderVidsfromDB(token);
//     },
//     null,
//     true,
//     "America/Los_Angeles"
// );

// getTrendsJob.start();
// renderFromDBJob.start();
