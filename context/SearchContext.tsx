import React, { createContext, useContext, useState } from "react";

interface SearchContextType {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState("");

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used inside SearchProvider");
  }
  return context;
};