import { useState, useEffect } from "react";

export interface Country {
  name: string;
  code: string;
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2");
        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }
        const data = await response.json();
        const formattedCountries: Country[] = data
          .map((country: { name: { common: string }; cca2: string }) => ({
            name: country.name.common,
            code: country.cca2,
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        setCountries(formattedCountries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load countries");
        // Fallback to common countries
        setCountries([
          { name: "Nigeria", code: "NG" },
          { name: "Ghana", code: "GH" },
          { name: "Kenya", code: "KE" },
          { name: "South Africa", code: "ZA" },
          { name: "United States", code: "US" },
          { name: "United Kingdom", code: "GB" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};
