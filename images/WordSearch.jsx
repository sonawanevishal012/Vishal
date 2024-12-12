import React, { useState, useEffect } from "react";
import "./css/WordSearch.css";
import wordsFromData from "./Words.js"; // Import the words from Words.js

// Helper function to generate the grid and place words
const generateGrid = (size, words) => {
    const grid = Array(size).fill(null).map(() => Array(size).fill(""));

    const placeWordInGrid = (word) => {
        const direction = Math.random() > 0.5 ? "horizontal" : "vertical";
        let placed = false;

        while (!placed) {
            const startRow = Math.floor(Math.random() * size);
            const startCol = Math.floor(Math.random() * size);

            if (direction === "horizontal") {
                if (startCol + word.length <= size) {
                    let fits = true;

                    for (let i = 0; i < word.length; i++) {
                        if (grid[startRow][startCol + i] !== "" && grid[startRow][startCol + i] !== word[i]) {
                            fits = false;
                            break;
                        }
                    }

                    if (fits) {
                        for (let i = 0; i < word.length; i++) {
                            grid[startRow][startCol + i] = word[i];
                        }
                        placed = true;
                    }
                }
            } else {
                if (startRow + word.length <= size) {
                    let fits = true;

                    for (let i = 0; i < word.length; i++) {
                        if (grid[startRow + i][startCol] !== "" && grid[startRow + i][startCol] !== word[i]) {
                            fits = false;
                            break;
                        }
                    }

                    if (fits) {
                        for (let i = 0; i < word.length; i++) {
                            grid[startRow + i][startCol] = word[i];
                        }
                        placed = true;
                    }
                }
            }
        }
    };

    words.forEach((word) => placeWordInGrid(word));

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (grid[row][col] === "") {
                grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }

    return grid;
};

// Helper function to pick random words
const getRandomWords = (words, numWords) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, numWords);
};

// WordSearch Component
const WordSearch = () => {
    const gridSize = 10;
    const noOfWords = 3;

    const [words, setWords] = useState(getRandomWords(wordsFromData, noOfWords));
    const [grid, setGrid] = useState(generateGrid(gridSize, words));
    const [selectedCells, setSelectedCells] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [foundWordCells, setFoundWordCells] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [gameWon, setGameWon] = useState(false);

    useEffect(() => {
        setGrid(generateGrid(gridSize, words));
    }, [words]);

    useEffect(() => {
        if (foundWords.length === words.length) {
            setGameWon(true);
            setTimeout(() => setGameWon(false), 3000);
        }
    }, [foundWords, words]);

    const restartGame = () => {
        const newWords = getRandomWords(wordsFromData, noOfWords);
        setWords(newWords);
        setSelectedCells([]);
        setFoundWords([]);
        setFoundWordCells([]);
        setIsDragging(false);
        setGameWon(false);
        setGrid(generateGrid(gridSize, newWords));
    };

    const handleCellClick = (row, col) => {
        if (isDragging) {
            const newSelectedCells = [...selectedCells, { row, col }];
            setSelectedCells(newSelectedCells);

            const selectedWord = newSelectedCells.map(cell => grid[cell.row][cell.col]).join("");

            if (isWordValid(newSelectedCells) && words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
                setFoundWords([...foundWords, selectedWord]);
                setFoundWordCells(prevCells => [...prevCells, ...newSelectedCells]);
                setSelectedCells([]);
            }
        }
    };

    const handleMouseDown = (row, col) => {
        setIsDragging(true);
        setSelectedCells([{ row, col }]);
    };

    const handleMouseEnter = (row, col) => {
        if (isDragging) {
            setSelectedCells([...selectedCells, { row, col }]);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);

        const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join("");
        if (isWordValid(selectedCells) && words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
            setFoundWords([...foundWords, selectedWord]);
            setFoundWordCells(prevCells => [...prevCells, ...selectedCells]);
        }
        setSelectedCells([]);
    };

    const isCellSelected = (row, col) => {
        return selectedCells.some(cell => cell.row === row && cell.col === col);
    };

    const isWordValid = (selectedCells) => {
        if (selectedCells.length < 2) return false;

        const isHorizontal = selectedCells[0].row === selectedCells[selectedCells.length - 1].row;
        const isVertical = selectedCells[0].col === selectedCells[selectedCells.length - 1].col;

        if (isHorizontal) {
            const sortedCols = selectedCells.map(cell => cell.col).sort((a, b) => a - b);
            return sortedCols.every((col, idx) => col === sortedCols[0] + idx);
        }

        if (isVertical) {
            const sortedRows = selectedCells.map(cell => cell.row).sort((a, b) => a - b);
            return sortedRows.every((row, idx) => row === sortedRows[0] + idx);
        }

        return false;
    };

    document.documentElement.style.setProperty('--grid-size', gridSize);

    return (
        <div className="word-search-container">
            <div className="controls">
                <button onClick={restartGame} className="restart-button">
                    New Puzzle
                </button>
                <label>
                    <h3>Find below words</h3>
                    <span>{words.join(", ")}</span>
                </label>
            </div>
            <div className="grid">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className={`grid-cell 
                                    ${isCellSelected(rowIndex, colIndex) ? "selected" : ""} 
                                    ${foundWordCells.some(c => c.row === rowIndex && c.col === colIndex) ? "found" : ""}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                onMouseUp={handleMouseUp}
                            >
                                {cell}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {gameWon && (
                <div className="win-popup">
                    <span role="img" aria-label="thumbs-up">👍</span>
                    <p>Great, You found all the words!</p>
                </div>
            )}
            <div className="found-words">
                <h4>Found Words:</h4>
                <ul>
                    {foundWords.map((word, index) => (
                        <li key={index}><s>{word}</s></li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WordSearch;
