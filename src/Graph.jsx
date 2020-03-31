import React, { useEffect, useState, useMemo } from "react"
import "./App.css"
import { Line } from "react-chartjs-2"
import { Box, RadioButtonGroup } from "grommet"
import Select from "react-select"
import useLiveData from "./useLiveData"
import useCountryPopulation from "./useCountryPopulation"

const colors = [
  "rgba(111, 255, 176, 0.8)",
  "rgba(253, 111, 255, 0.8)",
  "rgba(111, 255, 176, 0.4)",
  "rgba(253, 111, 255, 0.4)"
  // "rgba(129, 252, 237, 0.7)",
  // "rgba(255, 202, 88, 0.7)"
]

const getAsPopulationPercentage = (number, population) => {
  if (population) {
    return (number * 100) / population
  }
  return number
}

const getValuesAsLog = values => {
  return values.map(v => {
    return Math.log(v)
  })
}

const getCumulative = updatedCases => {
  return updatedCases.map((c, i) => {
    if (i > 1) {
      return c - updatedCases[i - 1]
    } else {
      return c
    }
  })
}

const Graph = () => {
  const liveData = useLiveData()
  const [cases, setCases] = useState({})
  const [deaths, setDeaths] = useState({})
  const [days, setDays] = useState({})
  const [selectedCountries, setSelectedCountries] = useState(["Italy", "US"])
  const [isCumulativeGraph, setIsCumulativeGraph] = useState(true)
  const [isPopulationPercentage, setPopulationPercentage] = useState(false)
  const [isLogMode, setIsLogMode] = useState(false)
  const countryPopulation = []
  countryPopulation[0] = useCountryPopulation(selectedCountries[0])
  countryPopulation[1] = useCountryPopulation(selectedCountries[1])

  const countries = useMemo(() => {
    return Object.keys(liveData)
  }, [liveData])

  useEffect(() => {
    if (liveData[selectedCountries[0]]) {
      const updatedCases = {}
      const updatedDeaths = {}
      const updatesDates = {}

      selectedCountries.forEach((selectedCountry, i) => {
        const allCases = liveData[selectedCountry].map(o => {
          const activeCases = Math.max(o.confirmed - o.recovered, 0)
          return getAsPopulationPercentage(
            activeCases,
            isPopulationPercentage && countryPopulation[i]
          )
        })
        const allDeaths = liveData[selectedCountry].map(o => {
          return getAsPopulationPercentage(
            o.deaths,
            isPopulationPercentage && countryPopulation[i]
          )
        })
        const dates = liveData[selectedCountry].map(o => o.date)
        const firstConfirmed = allCases.findIndex(c => c > 0)
        const casesSinceFirst = allCases.slice(firstConfirmed)
        const deathsSinceFirst = allDeaths.slice(firstConfirmed)
        updatedCases[selectedCountry] = isLogMode
          ? getValuesAsLog(casesSinceFirst)
          : casesSinceFirst
        updatedDeaths[selectedCountry] = isLogMode
          ? getValuesAsLog(deathsSinceFirst)
          : deathsSinceFirst
        updatesDates[selectedCountry] = dates
          .slice(firstConfirmed)
          .map((d, i) => i)
        // If we want daily values
        if (!isCumulativeGraph) {
          const dailyCases = getCumulative(updatedCases[selectedCountry])
          const dailyDeaths = getCumulative(updatedDeaths[selectedCountry])
          updatedCases[selectedCountry] = dailyCases
          updatedDeaths[selectedCountry] = dailyDeaths
          console.log("Deaths", dailyDeaths.length)
        }
      })
      setCases(updatedCases)
      setDeaths(updatedDeaths)
      setDays(updatesDates)
    }
  }, [
    countries,
    selectedCountries,
    isCumulativeGraph,
    isPopulationPercentage,
    isLogMode
  ])

  const graphData = useMemo(() => {
    if (Object.keys(cases).length) {
      const casesDatasets = Object.values(cases)
      const deathsDatasets = Object.values(deaths)
      const allDatasets = [...casesDatasets, ...deathsDatasets]
      const labels = [
        `${Object.keys(cases)[0]} Infected`,
        `${Object.keys(cases)[1]} Infected`,
        `${Object.keys(cases)[0]} Deaths`,
        `${Object.keys(cases)[1]} Deaths`
      ]
      return allDatasets.map((dataset, i) => ({
        label: `${labels[i]}`,
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
    <Box direction="column" pad="medium" width="large">
      Active Cases Since First Infection
      <Box direction="column" pad="medium">
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
                  },
                  scaleLabel: {
                    display: true,
                    fontColor: "#AAA",
                    labelString:
                      (isPopulationPercentage
                        ? "Percentage infected"
                        : "Number infected") + (isLogMode ? " (ln)" : "")
                  }
                }
              ],
              xAxes: [
                {
                  ticks: {
                    fontColor: "#AAA"
                  },
                  scaleLabel: {
                    display: true,
                    fontColor: "#AAA",
                    labelString: "Days since first infection"
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
      </Box>
      Countries to Compare:
      {/* <Box direction="column" pad="medium" align="center"> */}
      {selectedCountries.map((selected, i) => {
        return (
          <div key={`div${i}`} style={{ color: "black" }}>
            <Select
              key={`select${i}`}
              options={countries.map(c => {
                return { value: c, label: c }
              })}
              value={{ value: selected, label: selected }}
              onChange={({ value }) => {
                const newSelectedCountries = [...selectedCountries]
                newSelectedCountries[i] = value
                setSelectedCountries(newSelectedCountries)
              }}
            />
          </div>
        )
      })}
      {/* </Box> */}
      Graph Values:
      <Box direction="column" pad="medium">
        <RadioButtonGroup
          name={"isCumulativeGraphSelector"}
          options={["daily increase", "cumulative"]}
          value={isCumulativeGraph ? "cumulative" : "daily increase"}
          onChange={event => {
            setIsCumulativeGraph(event.target.value === "cumulative")
          }}
        />
      </Box>
      Graph Scale:
      <Box direction="column" pad="medium">
        <RadioButtonGroup
          name={"isPopulationPercentageSelector"}
          options={["raw numbers", "population percentage"]}
          value={
            isPopulationPercentage ? "population percentage" : "raw numbers"
          }
          onChange={event =>
            setPopulationPercentage(
              event.target.value === "population percentage"
            )
          }
        />
      </Box>
      Graph Mode:
      <Box direction="column" pad="medium">
        <RadioButtonGroup
          name={"isLogModeSelector"}
          options={["normal", "log"]}
          value={isLogMode ? "log" : "normal"}
          onChange={event => setIsLogMode(event.target.value === "log")}
        />
      </Box>
    </Box>
  )
}

export default Graph
