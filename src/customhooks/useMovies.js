import { useEffect, useState } from "react";

const KEY = "e0fbb59f";
// named export rather than default export, which is for components. Not mandatory though
// it is a function so we don't accept props, we accept arguments
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false); //initialise isLoading as false
  const [error, setError] = useState("");

  useEffect(
    function () {
      // callback?.(); // only call function if function exists
      // created so that we don't have an endless stream of API calls for each user letter input
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          // always reset the error
          setError("");
          // set is loading state to true just before the API call is made
          setIsLoading(true);
          const res = await fetch(
            `https://www.omdbapi.com/?&apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (query.length === 0) {
            setMovies([]);
            setError("");
            return;
          }

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();

          if (data.Response === "False") {
            throw new Error(" Movie not found");
          }

          setMovies(data.Search);
          setError("");
          // reset is loading state back to false
        } catch (err) {
          // ignore abort error
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      // close movie when searching in the search bar
      //   handleCloseMovie();
      fetchMovies();

      // clean up function
      return function () {
        controller.abort();
      };
    },
    [query] // update to 'query' state variable will re-run the useEffect function.
    // Effect reacts to changes to the 'query' state variable
  );
  return { movies, isLoading, error };
}
