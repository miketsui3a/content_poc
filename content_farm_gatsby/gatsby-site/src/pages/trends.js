import React, { useEffect, useState } from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { HorizontalBar } from "react-chartjs-2"

const TrendsPage = () => {
    const [chartState, setChartState] = useState()
    const template = {
        labels: [],
        datasets: [
            {
                label: "My First dataset",
                backgroundColor: "rgba(255,99,132,0.2)",
                borderColor: "rgba(255,99,132,1)",
                borderWidth: 1,
                hoverBackgroundColor: "rgba(255,99,132,0.4)",
                hoverBorderColor: "rgba(255,99,132,1)",
                data: [],
            },
        ],
    }
    useEffect(() => {
        async function f() {
            const res = await fetch("http://localhost:3001/trends")
            let data = await res.json()
            data.map(eachTrend => {
                if (eachTrend.trend.includes("M")) {
                    eachTrend.trend = parseInt(
                        eachTrend.trend.replace("M", "000000").replace("+", "")
                    )
                } else if (eachTrend.trend.includes("K")) {
                    eachTrend.trend = parseInt(
                        eachTrend.trend.replace("K", "000").replace("+", "")
                    )
                } else {
                    eachTrend.trend = parseInt(eachTrend.trend.replace("+", ""))
                }
            })

            data.map(x=>{
                template.labels.push(x.title)
                template.datasets[0].data.push(x.trend)
            })
            setChartState(template)
        }
        f()

    }, [])

    return (
        <Layout>
            <SEO title="Trends" />
            <HorizontalBar data={chartState} />
        </Layout>
    )
}

export default TrendsPage
