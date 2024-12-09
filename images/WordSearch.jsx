import React, { useEffect, useState, useCallback } from "react";
import "./css/WordSearch.css";

const Wordsearch = () => {
  const [mouseDown, setMouseDown] = useState(false);
  const numWords = 3;
  const [gameInitialized, setGameInitialized] = useState(false); // Track whether the game is initialized

  // Memoized checkWordCompletion to avoid unnecessary re-renders
  const checkWordCompletion = useCallback((word) => {
    const foundLetters = document.querySelectorAll(`.${word}.letter_pop`);
    if (foundLetters.length === word.length) {
      document.querySelectorAll(".listed_word").forEach((el) => {
        if (el.innerHTML === word) {
          el.classList.add("found_word");
          document.documentElement.style.setProperty("--bg-color", word);
        }
      });
      checkWinCondition();
    }
  }, []); // Memoized checkWordCompletion

  // Memoizing handleBlockClick and handleBlockHover to avoid unnecessary re-creations
  const handleBlockClick = useCallback((block, word) => {
    block.classList.add("letter_pop");
    block.style.background = word;
    checkWordCompletion(word);
  }, [checkWordCompletion]);

  const handleBlockHover = useCallback((block, word) => {
    if (mouseDown) {
      block.classList.add("letter_pop");
      block.style.background = word;
      checkWordCompletion(word);
    }
  }, [mouseDown, checkWordCompletion]);

  // Memoizing placeWord to avoid unnecessary re-renders
  const placeWord = useCallback((word, startIdx) => {
    const blocks = document.querySelectorAll(".block");
    word.split("").forEach((letter, idx) => {
      const block = blocks[startIdx + idx];
      block.innerHTML = letter;
      block.classList.add("letter", word);

      if (idx === 0) block.classList.add("first_letter");
      if (idx === word.length - 1) block.classList.add("last_letter");

      block.onmousedown = () => handleBlockClick(block, word);
      block.onmouseenter = () => handleBlockHover(block, word);
    });
  }, [handleBlockClick, handleBlockHover]);

  // Memoizing initializeWords to avoid unnecessary re-renders
  const initializeWords = useCallback(() => {
    // Clear any previously listed words
    const wordListContainer = document.querySelector("#word-list");
    wordListContainer.innerHTML = ""; // Clear previous words list

    const availableWords = [
      "red", "orange", "gold", "green", "blue", "indigo", "violet", "hotpink", "turquoise"
    ];
    availableWords.sort(() => Math.random() - 0.5);
    const selectedWords = availableWords.slice(0, numWords);

    const rowIndices = [];
    while (rowIndices.length < numWords) {
      const randomIndex = Math.floor(Math.random() * 10);
      if (!rowIndices.includes(randomIndex)) rowIndices.push(randomIndex);
    }

    selectedWords.forEach((word, i) => {
      const offset = Math.floor(Math.random() * (11 - word.length));
      const wordStart = offset + rowIndices[i] * 10;
      placeWord(word, wordStart); // placeWord is used here
      addWordToList(word);
    });
  }, [numWords, placeWord]); // Add placeWord to the dependency array

  const setGameUp = useCallback(() => {
    document.documentElement.style.setProperty("--bg-color", "#666");
    initializeBlocks();
    initializeWords();
    fillEmptyBlocks(); // Fill empty blocks with random letters
    setGameInitialized(true); // Mark the game as initialized
  }, [initializeWords]); // Add initializeWords to the dependency array

  const initializeBlocks = () => {
    const board = document.querySelector("#crossword_board");
    board.innerHTML = "";
    for (let i = 0; i < 100; i++) {
      const block = document.createElement("div");
      block.className = "block";
      board.appendChild(block);
    }
  };

  const addWordToList = (word) => {
    const wordElement = document.createElement("div");
    wordElement.className = "listed_word";
    wordElement.innerHTML = word;
    document.querySelector("#word-list").appendChild(wordElement); // Append to word-list container
  };

  const checkWinCondition = () => {
    if (document.querySelectorAll(".found_word").length === numWords) {
      document.querySelector("#crossword_board").classList.add("game_winner");
    }
  };

  const handleTouchMove = useCallback((event) => {
    const block = document.elementFromPoint(
      event.touches[0].clientX,
      event.touches[0].clientY
    );
    if (block && block.classList.contains("letter")) {
      const word = block.classList[2];
      block.style.background = word;
      block.classList.add("letter_pop");
      checkWordCompletion(word);
    }
  }, [checkWordCompletion]); // Include checkWordCompletion in the dependency array

  // Handle mouse movement while dragging
  const handleMouseMove = useCallback((event) => {
    if (mouseDown) {
      const block = document.elementFromPoint(event.clientX, event.clientY);
      if (block && block.classList.contains("letter")) {
        const word = block.classList[2];
        block.style.background = word;
        block.classList.add("letter_pop");
        checkWordCompletion(word);
      }
    }
  }, [mouseDown, checkWordCompletion]);

  // Fill empty blocks with random letters
  const fillEmptyBlocks = () => {
    const blocks = document.querySelectorAll(".block");
    blocks.forEach((block) => {
      if (!block.innerHTML) {
        const randomLetter =
          "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        block.innerHTML = randomLetter;
      }
    });
  };

  useEffect(() => {
    const board = document.querySelector("#crossword_board");
    board.addEventListener("mousedown", () => setMouseDown(true));
    board.addEventListener("mouseup", () => setMouseDown(false));
    board.addEventListener("mousemove", handleMouseMove); // Listen for mouse movement
    board.addEventListener("touchmove", handleTouchMove);

    // Initialize the game when the component is first mounted
    if (!gameInitialized) {
      setGameUp();
    }

    return () => {
      board.removeEventListener("mousedown", () => setMouseDown(true));
      board.removeEventListener("mouseup", () => setMouseDown(false));
      board.removeEventListener("mousemove", handleMouseMove); // Clean up mouse move listener
      board.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleTouchMove, handleMouseMove, setGameUp, gameInitialized]); // Both functions included in the dependency array

  // Handle "New Puzzle" button click
  const handleNewPuzzle = () => {
    // Remove game_winner class from the board when starting a new puzzle
    document.querySelector("#crossword_board").classList.remove("game_winner");

    setGameInitialized(false); // Reset game initialization state
    setGameUp(); // Start a new game
  };

  return (
    <div>
      <p>Click/Drag the letters to form words below</p>
      <button onClick={handleNewPuzzle}>New Puzzle</button>
      <div id="crossword_board"></div>
      <div id="word-list"></div> {/* Render words list here */}
    </div>
  );
};

export default Wordsearch;
