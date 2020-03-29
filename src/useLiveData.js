import React, { useEffect, useState, useMemo } from "react"

const useLiveData = () => {
  const [liveData, setLiveData] = useState({})
  useEffect(() => {
    console.log("Fetching COVID19 data")
    fetch("https://pomber.github.io/covid19/timeseries.json").then(res => {
      res.json().then(data => {
        console.log("COVID19 Data received")
        setLiveData(data)
      })
    })
  }, [])
  return liveData
}

export default useLiveData
