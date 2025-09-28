// src/context/RegionContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export interface Region {
  id: number
  name: string
  avatar: string
}

interface RegionContextType {
  selectedRegion: Region
  setSelectedRegion: (region: Region) => void
}

const defaultRegion: Region = {
 id: 1, name: 'Hyderabad East', avatar: 'https://img.icons8.com/?size=100&id=bhWyNd2wYF48&format=png&color=000000' ,
}

const RegionContext = createContext<RegionContextType | undefined>(undefined)

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedRegion, setSelectedRegion] = useState<Region>(defaultRegion)

  return (
    <RegionContext.Provider value={{ selectedRegion, setSelectedRegion }}>
      {children}
    </RegionContext.Provider>
  )
}

export const useRegion = () => {
  const context = useContext(RegionContext)
  if (!context) {
    throw new Error('useRegion must be used within RegionProvider')
  }
  return context
}
