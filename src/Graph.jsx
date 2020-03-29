import React, { useEffect, useState, useMemo } from "react"
import "./App.css"
import { Line } from "react-chartjs-2"
import { Box, Select, RadioButtonGroup } from "grommet"
import useLiveData from "./useLiveData"
import useCountryPopulation from "./useCountryPopulation"

const colors = ["#6FFFB0", "#FD6FFF", "#81FCED", "#FFCA58"]

const Graph = () => {
  const liveData = useLiveData()
  const [cases, setCases] = useState({})
  const [days, setDays] = useState({})
  const [selectedCountries, setSelectedCountries] = useState(["Italy", "US"])
  const [isCumulativeGraph, setIsCumulativeGraph] = useState(true)
  const [isPopulationPercentage, setPopulationPercentage] = useState(false)

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
        // If we want daily values
        if (!isCumulativeGraph) {
          const dailyValues = updatedCases[selectedCountry].map((c, i) => {
            if (i > 1) {
              return c - updatedCases[selectedCountry][i - 1]
            } else {
              return c
            }
          })
          updatedCases[selectedCountry] = dailyValues
        }
      })
      setCases(updatedCases)
      setDays(updatesDates)
    }
  }, [countries, selectedCountries, isCumulativeGraph])

  const graphData = useMemo(() => {
    if (Object.keys(cases).length) {
      const datasets = Object.values(cases)
      return datasets.map((dataset, i) => ({
        label: `${Object.keys(cases)[i]}`,
        borderColor: colors[i],
        pointStyle: "line",
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
        options={{
          legend: {
            labels: {
              fontColor: "#AAA"
            }
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  fontColor: "#AAA"
                }
              }
            ],
            xAxes: [
              {
                ticks: {
                  fontColor: "#AAA"
                }
              }
            ]
          }
        }}
        data={{
          labels: longestNumDays,
          datasets: graphData
        }}
      />
      Countries:
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
      Graph Type:
      <RadioButtonGroup
        name={"isCumulativeGraphSelector"}
        options={["daily cases", "cumulative"]}
        value={isCumulativeGraph ? "cumulative" : "daily cases"}
        onChange={event => {
          setIsCumulativeGraph(event.target.value === "cumulative")
        }}
      />
      Graph Scale:
      <RadioButtonGroup
        name={"isPopulationPercentageSelector"}
        options={["raw numbers", "population percentage"]}
        value={isPopulationPercentage ? "population percentage" : "raw numbers"}
        onChange={event =>
          setPopulationPercentage(
            event.target.value === "population percentage"
          )
        }
        disabled
      />
    </Box>
  )
}

export default Graph
