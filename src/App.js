import { useEffect, useRef, useState } from "react";
import StarRating from "./components/StarRating";
import { Skeleton } from "@mui/material";

const KEY = "e0fbb59f";

// structural component
export default function App() {
  // prop drill movie to the movielist component
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false); //initialise isLoading as false
  const [error, setError] = useState("");
  // selected ID state lifted up. It will be passed down into the watch box child
  const [selectedID, setSelectedID] = useState(null);
  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return JSON.parse(storedValue);
  });

  // useEffect(function () {
  //   console.log("Only after initial render");
  // }, []);

  // useEffect(function () {
  //   console.log("After every render of any state/prop");
  // });

  // useEffect(
  //   function () {
  //     console.log("synchronised with 'query' state changes");
  //   },
  //   [query]
  // );

  // console.log("During render");

  function handleAddWatched(movie) {
    // add new movie object to the array
    setWatched((watched) => [...watched, movie]);
    // // store in local storage. Need to re append due to stale state
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  // onclick a movie
  function handleSelectMovie(id) {
    setSelectedID((selectedId) => (id === selectedID ? null : id));
  }

  function handleCloseMovie() {
    setSelectedID(null);
  }

  function handleDeleteWatched(id) {
    // remove with id
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      // store in local storage
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  useEffect(
    function () {
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
      handleCloseMovie();
      fetchMovies();

      // clean up function
      return function () {
        controller.abort();
      };
    },
    [query] // update to 'query' state variable will re-run the useEffect function.
    // Effect reacts to changes to the 'query' state variable
  );

  return (
    <>
      {/* NavBar does not need movies prop anymore */}
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      {/* Main does not need movies prop anymore */}
      <Main>
        {/* Listbox */}
        <Box>
          {isLoading ? (
            <MovieLoader />
          ) : (
            <MovieList movies={movies} onSelectedMovie={handleSelectMovie} />
          )}
          {/* they have to be mutually exclusive. Only one can be rendered at one time */}
          {/* {isLoading && <Loader />} */}
          {/* {isLoading && !error && <MovieList movies={movies} />} */}
          {error && <ErrorMessage message={error} />}
        </Box>
        {/* WatchBox */}
        <Box>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function MovieLoader() {
  // this is where I can add a chakra-ui spinning animation
  return [...Array(8)].map((x, i) => (
    <Skeleton
      variant="rounded"
      width="100%"
      height={95}
      sx={{ marginTop: 1 }}
      key={i}
    />
  ));
}

function MoviePreviewLoader() {
  return (
    <>
      <Skeleton variant="rounded" width="100%" height={200} />
      <Skeleton
        variant="rounded"
        width="100%"
        height={350}
        sx={{ marginTop: 3 }}
      />
    </>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>📛</span>
      {message}
    </p>
  );
}

// structural component
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

// presentational stateless component
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// presentational stateless component
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

// stateful component
function Search({ query, setQuery }) {
  // use ref hook to select input DOM element
  const inputEl = useRef(null);

  // write code for ref using the useEffect() hook
  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEl.current) {
          return;
        }

        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      // we dedicate a separate callback function so that we can cleanup
      document.addEventListener("keydown", callback);
      // access current ref box, represents the input DOM element itself
      inputEl.current.focus();
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      // use ref here to tie dependency on the input DOM element
      ref={inputEl}
      onChange={(e) => {
        setQuery(e.target.value);
        // if (e.target.value === "") {
        //   // reset page title if no string is entered in the text box
        //   document.title = "usePopcorn";
        // }
      }}
    />
  );
}

// structural component
// replace 'movies' that is a prop to be 'prop drilled' with 'children'
function Main({ children }) {
  return (
    <main className="main">
      {/* empty box for reusability that can load anything */}
      {children}
    </main>
  );
}

// stateful component
// replace list box with children, so that component composition can take place
// and no prop drilling is required
// function ListBox({ children }) {
//   const [isOpen1, setIsOpen1] = useState(true);
//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen1((open) => !open)}
//       >
//         {isOpen1 ? "–" : "+"}
//       </button>

//     </div>
//   );
// }

// stateful component
function MovieList({ movies, onSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectedMovie={onSelectedMovie}
        />
      ))}
    </ul>
  );
}

// stateless component
function Movie({ movie, onSelectedMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && <>{children}</>}
    </div>
  );
}

// stateful component
// function WatchBox({ watched }) {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedMovieList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

// stateless component
function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

// stateless component
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        ></button>
      </div>
    </li>
  );
}

// stateful component
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies / TV Shows you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function MovieDetails({ selectedID, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  // we use a ref as we dont want to trigger a re-render when we click on star rating multiple times
  const countRef = useRef(0);

  // cannot mutate the ref in render logic. Need to use use effect
  useEffect(
    function () {
      if (userRating) {
        countRef.current = countRef.current + 1;
      }
    },
    [userRating]
  );

  const watchedIDs = watched.map((movie) => movie.imdbID);
  // derived state
  const isWatched = watchedIDs.includes(selectedID);
  // in case it is not found, optional chain
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedID
  )?.userRating;

  const {
    Title: title,
    Type: type,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // function movieInWatchedList(id) {
  //   return watched.some((w) => w.imdbID === id);
  //   // const isWatched = watched.map((movie) => movie.imdbID);
  // }

  var outputType = "";
  if (type !== undefined) {
    outputType = type.charAt(0).toUpperCase() + type.slice(1);
  }

  // to display on screen you need a new piece of state
  // const [avgRating, setAvgRating] = useState(0);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);

    onCloseMovie();
    // state is set asynchronously so it is not showing the latest update of the state
    // setAvgRating(Number(imdbRating));
    // setAvgRating((avgRating) => (avgRating + userRating) / 2);

    // alert((avgRating + userRating) / 2);
  }

  // useEffect is the 'escape' hatch. Allows you to write pure JS and avoid using the React way
  useEffect(
    function () {
      function callback(e) {
        // if the escape button is pressed on the keyboard
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }

      document.addEventListener("keydown", callback);

      // cleanup
      return function () {
        // prevent multiple event listeners occuring when pressing the escape key
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?&apikey=${KEY}&i=${selectedID}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
        // can add error handling
      }

      getMovieDetails();
    },
    [selectedID] //code will execute each time the selectedID state changes
  );

  // effect to change the title of the page based on the loaded movie/tv show
  useEffect(
    function () {
      if (!title) return;
      document.title = `${outputType} | ${title} ${
        userRating && `(Rated ${userRating} ⭐️)`
      }`;

      // cleanup function
      // runs after the component unmounts
      // closure. Title will be remembered after unmount
      return function () {
        document.title = "usePopcorn";
        // clos
        // console.log(`clean up effect for movie ${title}`)
      };
    },
    [title, userRating] // waits for this variable to changed, then will execute code once this property mounts or rerenders
  );

  return (
    <div className="details">
      {isLoading ? (
        <MoviePreviewLoader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {type === "movie" && <p>🎬</p>}
                {type === "series" && <p>📺</p>}
                {type === "game" && <p>🎮</p>}
                {outputType} &bull; {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          {/* <p>{avgRating}</p> */}
          <section>
            {!isWatched ? (
              <div className="rating">
                <StarRating
                  maxRating={10}
                  size={24}
                  onSetRating={setUserRating}
                />

                {userRating > 0 && (
                  <button className="btn-add" onClick={handleAdd}>
                    + Add to list
                  </button>
                )}
              </div>
            ) : (
              <p className="rating">
                You rated this {type} {watchedUserRating} ⭐️
              </p>
            )}
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
