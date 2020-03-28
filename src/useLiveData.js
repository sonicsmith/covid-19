import React, { useEffect, useState, useMemo } from "react"

const useLiveData = () => {
  const [liveData, setLiveData] = useState({})
  useEffect(() => {
    console.log("Fetch")
    fetch("https://pomber.github.io/covid19/timeseries.json").then(res => {
      res.json().then(data => {
        console.log("Data received")
        setLiveData(data)
      })
    })
  }, [])
  return liveData
}

export default useLiveData
