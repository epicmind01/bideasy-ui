'use client'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { useRegion } from '../../context/RegionContext'

const regions = [
  { id: 1, name: 'Hyderabad East', avatar: 'https://img.icons8.com/?size=100&id=bhWyNd2wYF48&format=png&color=000000' },
  { id: 2, name: 'Hyderabad West', avatar: 'https://img.icons8.com/?size=100&id=YlWa6gs9LLdu&format=png&color=000000' },
  { id: 3, name: 'Bangalore', avatar: 'https://img.icons8.com/?size=100&id=45075&format=png&color=000000' },
  { id: 4, name: 'Chennai', avatar: 'https://img.icons8.com/?size=100&id=R9Tdo5s7to5K&format=png&color=000000' },
  { id: 5, name: 'Vijayawada', avatar: 'https://img.icons8.com/?size=100&id=o0GuOjFrbOnm&format=png&color=000000' },
]

export default function RegionFilter() {
  const { selectedRegion, setSelectedRegion } = useRegion()

  return (
    <Listbox value={selectedRegion} onChange={setSelectedRegion}>
  <div className="relative mt-0">
    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-lg bg-white py-3 pr-3 pl-6 text-left text-blue-900 shadow-xs ring-1 ring-inset ring-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-200 sm:text-sm transition-all">
      <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
        <img alt="" src={selectedRegion.avatar} className="size-5 shrink-0 " />
        <span className="block truncate font-medium">{selectedRegion.name}</span>
      </span>
      <ChevronUpDownIcon
        aria-hidden="true"
        className="col-start-1 row-start-1 size-5 self-center justify-self-end text-blue-400 sm:size-4"
      />
    </ListboxButton>

    <ListboxOptions
      transition
      className="absolute z-10 mt-2 max-h-60 min-w-full w-max overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-blue-100 focus:outline-none data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0"
    >
      {regions.map((region) => (
        <ListboxOption
          key={region.id}
          value={region}
          className="group relative cursor-default select-none rounded-md py-2 pr-10 pl-4 text-blue-900 hover:bg-blue-50 data-focus:bg-blue-100 data-focus:text-blue-900 data-selected:bg-blue-100 data-selected:font-semibold transition-all"
        >
          <div className="flex items-center gap-3">
            <img alt="" src={region.avatar} className="size-5 shrink-0 " />
            <span className="block truncate">{region.name}</span>
          </div>

          {/* Optional check icon for selected */}
          {/* 
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-500 group-not-data-selected:hidden">
            <CheckIcon aria-hidden="true" className="size-5" />
          </span>
          */}
        </ListboxOption>
      ))}
    </ListboxOptions>
  </div>
</Listbox>

  )
}