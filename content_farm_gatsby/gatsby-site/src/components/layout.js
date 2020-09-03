/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql, Link } from "gatsby"
import styled from "styled-components"

import Header from "./header"
import {
    Navbar,
    Nav,
    NavDropdown,
    Form,
    Button,
    FormControl,
} from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"

import "./layout.css"

const LayoutWrap = styled.div`
  margin: 0 auto;
  max-width: 750px;
  padding: 1rem;

  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const BodyFooterWrap = styled.div`
    flex-grow: 1;
`

const Layout = ({ children }) => {
    const data = useStaticQuery(graphql`
        query SiteTitleQuery {
            site {
                siteMetadata {
                    title
                }
            }
        }
    `)
    console.log(data)
    return (
        <>
            <LayoutWrap>
                <BodyFooterWrap>
                    <Header siteTitle={data.site.siteMetadata.title} />
                    <main>{children}</main>
                </BodyFooterWrap>
                <footer>
                    © {new Date().getFullYear()}, Built with
                    {` `}
                    <a href="https://www.gatsbyjs.org">Gatsby</a>
                </footer>
            </LayoutWrap>
        </>
    )
}

Layout.propTypes = {
    children: PropTypes.node.isRequired,
}

export default Layout
