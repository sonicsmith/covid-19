import React, { useEffect, useState, useMemo } from "react"

const useCountryPopulation = country => {
  const [population, setPopulation] = useState()
  useEffect(() => {
    console.log("Fetch")
    fetch(
      `https://jsonmock.hackerrank.com/api/countries/search?name=${country}`
    ).then(res => {
      res.json().then(({ data }) => {
        console.log("Data received")
        setPopulation(data.population)
      })
    })
  }, [country])
  return population
}

export default useCountryPopulation
