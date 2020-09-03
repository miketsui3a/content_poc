const express = require("express");
const YouTube = require("simple-youtube-api");
const googleTrends = require("google-trends-api");
const youtube = new YouTube("AIzaSyCQtS6adhR3yxI5P_dm1iN9MqStgz_I1G0");
const app = express();
const port = 3001;

app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8001");
  youtube
    .getPlaylist(
      "https://www.youtube.com/playlist?list=UU86kVC3BTzOVFNV6E3Vb_ag"
    )
    .then((playlist) => {
      console.log(`The playlist's title is ${playlist.title}`);
      playlist
        .getVideos()
        .then((videos) => {
          res.send(videos);
        })
        .catch(console.log);
    })
    .catch(console.log);
});

app.get("/trends", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8001");
  googleTrends.dailyTrends(
    {
      trendDate: new Date(),
      geo: "US",
    },
    function (err, results) {
      if (err) {
        console.log("oh no error!", err);
      } else {
        let data = [];
        JSON.parse(results).default.trendingSearchesDays[0].trendingSearches.map(trend=>{
            data.push({title: trend.title.query, trend: trend.formattedTraffic})
        })
        console.log(data)
        res.send(data)
      }
    }
  );
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
