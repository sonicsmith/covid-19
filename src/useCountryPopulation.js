import React, { useEffect, useState, useMemo } from "react"

const countryNameMap = {
  US: "United States"
}

const useCountryPopulation = country => {
  const [population, setPopulation] = useState()
  useEffect(() => {
    console.log("Fetching Population")
    const convertedName = countryNameMap[country] || country
    console.log(convertedName)
    fetch(
      `https://jsonmock.hackerrank.com/api/countries/search?name=${convertedName}`
    ).then(res => {
      res.json().then(({ data }) => {
        const correctData = data.find(d => d.name === convertedName)
        console.log(
          "Population received",
          country,
          correctData && correctData.population
        )
        if (!(correctData && correctData.population)) {
          alert(
            `Couldn't get population for ${convertedName}. Please select raw numbers`
          )
        }
        setPopulation(correctData && correctData.population)
      })
    })
  }, [country])
  return population
}

export default useCountryPopulation
