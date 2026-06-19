// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

// useDebounce delays updating a value until the user stops typing.
// Without this, every keystroke in the search box fires an API call.
// With this, we wait until they pause for `delay` milliseconds.
//
// Usage:
//   const debouncedSearch = useDebounce(searchInput, 500);
//   useEffect(() => { fetchJobs(debouncedSearch) }, [debouncedSearch]);
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update debouncedValue after `delay` ms
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: if value changes before delay is up, cancel the timer
    // This is what makes debounce work — the timer resets on every keystroke
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;