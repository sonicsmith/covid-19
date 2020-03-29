import React, { useEffect, useState, useMemo } from "react"
import "./App.css"
import { Line } from "react-chartjs-2"
import { Box, Select } from "grommet"
import useLiveData from "./useLiveData"

const colors = ["#F00", "#0F0", "#00F"]

const Graph = () => {
  const liveData = useLiveData()
  const [cases, setCases] = useState({})
  const [days, setDays] = useState({})
  const [selectedCountries, setSelectedCountries] = useState([
    "New Zealand",
    "Australia"
  ])

  const countries = useMemo(() => {
    return Object.keys(liveData)
  }, [liveData])

  useEffect(() => {
    if (liveData[selectedCountries[0]]) {
      const updatedCases = {}
      const updatesDates = {}
      selectedCountries.forEach(selectedCountry => {
        const allCases = liveData[selectedCountry].map(o => o.confirmed)
        const dates = liveData[selectedCountry].map(o => o.date)
        const firstConfirmed = allCases.findIndex(c => c > 0)
        updatedCases[selectedCountry] = allCases.slice(firstConfirmed)
        updatesDates[selectedCountry] = dates.slice(firstConfirmed)
      })
      setCases(updatedCases)
      setDays(updatesDates)
    }
  }, [countries, selectedCountries])

  const graphData = useMemo(() => {
    if (Object.keys(cases).length) {
      const datasets = Object.values(cases)
      return datasets.map((dataset, i) => ({
        label: `Confirmed Cases ${Object.keys(cases)[i]}`,
        borderColor: colors[i],
        data: dataset
      }))
    } else {
      return []
    }
  }, [cases, days])

  const longestNumDays = useMemo(() => {
    let longestAxis = 0
    let longestCountry
    Object.keys(days).forEach((key, i) => {
      if (days[key].length > longestAxis) {
        longestAxis = days[key].length
        longestCountry = key
      }
    })
    return days[longestCountry]
  }, [days])

  return (
    <Box
      direction="column"
      border={{ color: "brand", size: "medium" }}
      pad="medium"
      elevation="medium"
      round="medium"
    >
      <Line
        data={{
          labels: longestNumDays,
          datasets: graphData
        }}
        // width={500}
        // height={250}
      />

      {selectedCountries.map((selected, i) => {
        return (
          <Select
            key={`country${i}`}
            options={countries}
            value={selected}
            onChange={({ option }) => {
              const newSelectedCountries = [...selectedCountries]
              newSelectedCountries[i] = option
              setSelectedCountries(newSelectedCountries)
            }}
          />
        )
      })}
    </Box>
  )
}

export default Graph
