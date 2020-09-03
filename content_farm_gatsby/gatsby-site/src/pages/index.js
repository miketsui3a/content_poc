import React, { useEffect, useState } from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"
import Video from "../components/video"

const IndexPage = () => {
    const [vidState, setVidState] = useState([])

    useEffect(() => {
        async function f() {
            let res = await fetch("http://localhost:3001")
            let data = await res.json()
            console.log(data)
            setVidState(data)
        }
        f()
    },[])
    return (
        <Layout>
            <SEO title="Home" />
            {vidState.map(vid => {
                return (
                    <Video
                        link={`https://www.youtube.com/watch?v=${vid.id}`}
                        title={vid.title}
                    ></Video>
                )
            })}
        </Layout>
    )
}

export default IndexPage
