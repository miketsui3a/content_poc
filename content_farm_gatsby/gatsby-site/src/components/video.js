import React from "react"
import ReactPlayer from "react-player"
import styled from "styled-components"

const Wrap = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 30px;
`
const Video = ({ link, title }) => {
    return (
        <Wrap>
            <h5>{title}</h5>
            <ReactPlayer url={link} light />
        </Wrap>
    )
}

export default Video
