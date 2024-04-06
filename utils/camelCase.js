//Export function that makes strings camelCase
const camelCase = (str) => {
  // First, trim whitespace and convert the string to lower case
  return (
    str
      .trim()
      .toLowerCase()
      // Split the string on spaces, then reduce the array to build the camelCase string
      .split(" ")
      .reduce((result, word, index) => {
        // If it's the first word, return it as is (in lowercase already).
        // Otherwise, capitalize the first letter of the word.
        return (
          result +
          (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        );
      }, "")
  ); // The initial value of the result is an empty string
};

export default camelCase;
