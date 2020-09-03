import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import styled from "styled-components"

const HeaderWrap = styled.div`
  padding: 1rem 0 3rem;
  
  h1 {
    color: #000000;
    font-size: 3rem;
    text-decoration: none;
  }

  ul {
    display: flex;
    list-style-type: none;
    margin: 0;
  }

  a {
    color: #999999;
    font-size: .9rem;
    margin-right: 1.3rem;
    text-decoration: none;
  }

`

const Header = ({ siteTitle }) => (
    <header>
        <HeaderWrap>
            <h1>{siteTitle}</h1>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/trends">Trends</Link>
                </li>
            </ul>
        </HeaderWrap>
    </header>
)

Header.propTypes = {
    siteTitle: PropTypes.string,
}

Header.defaultProps = {
    siteTitle: ``,
}

export default Header
