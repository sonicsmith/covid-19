import React, { useEffect, useState, useMemo } from "react"
import "./App.css"
import { Line } from "react-chartjs-2"
import { Box, Menu } from "grommet"
import useLiveData from "./useLiveData"

const Graph = () => {
  const liveData = useLiveData()
  const [cases, setCases] = useState([])
  const [days, setDays] = useState([])
  const [selectedCountry, setSelectedCountry] = useState("New Zealand")

  const countries = useMemo(() => {
    return Object.keys(liveData)
  }, [liveData])

  const countryItems = useMemo(() => {
    return countries.map(c => {
      return { label: c, onClick: () => setSelectedCountry(c) }
    })
  }, [countries])

  useEffect(() => {
    if (liveData[selectedCountry]) {
      const allCases = liveData[selectedCountry].map(o => o.confirmed)
      const dates = liveData[selectedCountry].map(o => o.date)
      const firstConfirmed = allCases.findIndex(c => c > 0)

      setCases(allCases.slice(firstConfirmed))
      setDays(dates.slice(firstConfirmed))
    }
  }, [countries, selectedCountry])

  return (
    <Box
      direction="row"
      border={{ color: "brand", size: "medium" }}
      pad="medium"
      elevation="medium"
      round="medium"
    >
      <Line
        data={{
          labels: days,
          datasets: [
            {
              label: "Confirmed Cases",
              data: cases
            }
          ]
        }}
        // width={500}
        // height={250}
      />
      <Menu label="Country" items={countryItems} />
    </Box>
  )
}

export default Graph
