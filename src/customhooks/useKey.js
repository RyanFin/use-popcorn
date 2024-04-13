import { useEffect } from "react";

export function useKey(key, action) {
  // write code for ref using the useEffect() hook
  // useEffect is the 'escape' hatch. Allows you to write pure JS and avoid using the React way
  useEffect(
    function () {
      function callback(e) {
        // if the escape button is pressed on the keyboard
        if (e.code.toLowerCase() === key.toLowerCase()) {
          action();
        }
      }
      // we dedicate a separate callback function so that we can cleanup
      document.addEventListener("keydown", callback);
      //   cleanup for useEffect
      return function () {
        // prevent multiple event listeners occuring when pressing the escape key
        document.removeEventListener("keydown", callback);
      };
    },
    [action, key]
  );
}
