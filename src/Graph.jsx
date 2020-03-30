import React, { useEffect, useState, useMemo } from "react"
import "./App.css"
import { Line } from "react-chartjs-2"
import { Box, Select, RadioButtonGroup } from "grommet"
import useLiveData from "./useLiveData"
import useCountryPopulation from "./useCountryPopulation"

const colors = [
  "rgba(111, 255, 176, 0.7)",
  "rgba(253, 111, 255, 0.7)",
  "rgba(129, 252, 237, 0.7)",
  "rgba(255, 202, 88, 0.7)"
]

const getAsPopulationPercentage = (number, population) => {
  return (number * 100) / population
}

const getValuesAsLog = values => {
  return values.map(v => {
    return Math.log(v)
  })
}

const Graph = () => {
  const liveData = useLiveData()
  const [cases, setCases] = useState({})
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
      const updatesDates = {}
      selectedCountries.forEach((selectedCountry, i) => {
        const allCases = liveData[selectedCountry].map(o => {
          const activeCases = Math.max(o.confirmed - o.recovered, 0)
          if (isPopulationPercentage) {
            if (!countryPopulation[i]) {
              alert(
                `Couldn't get population for ${selectedCountry}. Please select raw numbers`
              )
              return 0
            }
            return getAsPopulationPercentage(activeCases, countryPopulation[i])
          } else {
            return activeCases
          }
        })
        const dates = liveData[selectedCountry].map(o => o.date)
        const firstConfirmed = allCases.findIndex(c => c > 0)
        const casesSinceFirst = allCases.slice(firstConfirmed)
        const logCases = getValuesAsLog(casesSinceFirst)
        updatedCases[selectedCountry] = isLogMode ? logCases : casesSinceFirst
        updatesDates[selectedCountry] = dates
          .slice(firstConfirmed)
          .map((d, i) => i)
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
  }, [
    countries,
    selectedCountries,
    isCumulativeGraph,
    isPopulationPercentage,
    isLogMode
  ])

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
      <Box direction="column" pad="medium" align="center">
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
