import { useEffect, useState } from "react";
import StarRating from "./components/StarRating";
import { Skeleton } from "@mui/material";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const KEY = "e0fbb59f";

// structural component
export default function App() {
  // prop drill movie to the movielist component
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false); //initialise isLoading as false
  const [error, setError] = useState("");
  // selected ID state lifted up. It will be passed down into the watch box child
  const [selectedID, setSelectedID] = useState(null);

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
      async function fetchMovies() {
        try {
          // always reset the error
          setError("");
          // set is loading state to true just before the API call is made
          setIsLoading(true);
          const res = await fetch(
            `https://www.omdbapi.com/?&apikey=${KEY}&s=${query}`
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
          // reset is loading state back to false
        } catch (err) {
          console.log(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      fetchMovies();
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
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
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

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);

    onCloseMovie();
  }

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
      document.title = `${title} ${userRating && `(Rated ${userRating} ⭐️)`}`;

      // cleanup function
      return function () {
        document.title = "usePopcorn";
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
                {type === "movie" ? <p>🎬</p> : <p>📺</p>}
                {outputType} &bull; {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
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
                You rated this movie {watchedUserRating} ⭐️
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
