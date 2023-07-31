import './styles/colors.css';
import './styles/App.css';
import React, { useState, useEffect} from 'react';
import { SlButton, SlDialog, SlInput } from "@shoelace-style/shoelace/dist/react";

import {TabList, Tab, buildHTMLfile} from './components/Tabs';
import VirtualPage from './components/VirtualPage';
import Editor from './components/Editor';
import Chat from './components/Chat';
import ChatMessage from './components/ChatMessage';
import { getSavedStates, saveState, updateStateByName, updateStatesName, deleteState } from "./components/SavedStates";
import { Filecontext } from './components/FileContext';

import AI from './model/AI';

function App() {
	const default_html_text = "<!-- HTML generated code will appear here --> <h1>Preview for html, css, and javascript code</h1>";
	const default_css_text = "/* Css styles will be applied from here */"
	const default_js_text = "//Javascript code will appear here"

	const [activeTab, setActiveTab] = useState(0);
	const [html, setHtml] = useState(default_html_text);
	const [css, setCss] = useState(default_css_text);
	const [js, setJs] = useState(default_js_text);
	const [messages, setMessages] = useState([]);

	const [loadingResponse, setLoadingResponse] = useState(false);

	const [usedTokens, setUsedTokens] = useState("0");
	const [moneySpent, setMoneySpent] = useState("0.00");

	// Show a Dialog if the API key is not set in the localStorage yet or if it is not valid
	const [isCheckingAPIKey, setIsCheckingAPIKey] = useState(false);
	const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(!AI.isInitialized && !localStorage.getItem("api_key"));

	const [savedStates, setSavedStates] = useState([]);
	const [showSavedStates, setShowSavedStates] = useState(false);

	const [selectedStateIndex, setSelectedStateIndex] = useState(null);

	const [isEditingStateName, setIsEditingStateName] = useState(false);
  	const [editedStateName, setEditedStateName] = useState("");

	function handleReset() {
		setHtml(default_html_text);
		setCss(default_css_text);
		setJs(default_js_text);
		setSelectedStateIndex(null); // Deselect the currently selected state, if any
	}

	function handleCopy() {
		switch (activeTab) {
		  case "page":
			const full_html = buildHTMLfile(html, css, js);
			copyToClipboard(full_html);
			break;
		  case "html":
			copyToClipboard(html);
			break;
		  case "css":
			copyToClipboard(css);
			break;
		  case "js":
			copyToClipboard(js);
			break;
		  default:
			break;
		}
	  }
	  
	  // Helper function to copy the provided content to the clipboard
	  function copyToClipboard(content) {
		const textarea = document.createElement("textarea");
		textarea.value = content;
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand("copy");
		document.body.removeChild(textarea);
	  }
	  

	// Function to handle selecting a state in the table
	function handleSelectState(index) {
		if(index !== selectedStateIndex){
			if(selectedStateIndex !== null && selectedStateIndex >= 0){
				handleSaveExistingState(selectedStateIndex);
			}
			setSelectedStateIndex(index);
			setIsEditingStateName(false);
			setEditedStateName("");
			handleLoadState(index);
		}
	}

	// Fetch saved states from localStorage on component mount
	useEffect(() => {
		const states = getSavedStates();
		setSavedStates(states);
	}, []);

	if (localStorage.getItem("api_key") && !AI.isInitialized && !isCheckingAPIKey) {
		checkAPIKeyValidity();
	}

	function checkAPIKeyValidity() {
		setIsCheckingAPIKey(true);
		AI.checkAPIKey(localStorage.getItem("api_key")).then((isValid) => {
			if (isValid) {
				AI.initWithKey(localStorage.getItem("api_key"));
				setShowAPIKeyDialog(false);
			} else {
				localStorage.removeItem("api_key");
				setShowAPIKeyDialog(true);
			}
			setIsCheckingAPIKey(false);
		});
	}

	function addMessage(message_text) {
		if (loadingResponse) {
			console.error("Can't send message while waiting for response");
			return;
		}
		setLoadingResponse(true);

		const newMessages = [
			...messages,
			new ChatMessage("user", message_text, html, css, js)
		]
		setMessages(newMessages);

		AI.getResponseMessage(newMessages).then(responseMessage => {
			setMessages([...newMessages, responseMessage]);
			setLoadingResponse(false);

			let _used_tokens = AI.totalUsedTokens;
			let _money_spent = AI.totalUsedTokensUSD.toFixed(4);
			if (AI.totalUsedTokens > 1000) _used_tokens = Math.round(AI.totalUsedTokens / 1000) + "k";
			if (AI.totalUsedTokens > 1000000) _used_tokens = Math.round(AI.totalUsedTokens / 1000000) + "M";
			setUsedTokens(_used_tokens);
			setMoneySpent(_money_spent);
			

			if (responseMessage.html) setHtml(responseMessage.html);
			if (responseMessage.css) setCss(responseMessage.css);
			if (responseMessage.js) setJs(responseMessage.js);
		});
	}

	// Function to handle saving the current state
	function handleSaveState() {
		// Show a dialog to get the state name from the user
		const stateName = prompt("Enter a name for the saved state:");
	
		// Check if the user canceled or provided an empty name
		if (stateName === null || stateName.trim() === "") {
		alert("Please provide a valid name for the saved state.");
		return;
		}
	
		// Save the current state with the provided name
		try {
		saveState(stateName, html, css, js);
		// alert(`State "${stateName}" saved successfully!`);
		} catch (error) {
		console.error("Error saving state:", error);
		alert("An error occurred while saving the state. Please try again.");
		}
	
		// Update the savedStates state to immediately display the new saved state
		const updatedSavedStates = getSavedStates();
		setSavedStates(updatedSavedStates);
	}

	function handleSaveExistingState() {
		// Save the current state with the provided name
		try {
		const savedState = savedStates[selectedStateIndex];
		updateStateByName(savedState.name, html, css, js);
		// alert(`State "${stateName}" saved successfully!`);
		} catch (error) {
		console.error("Error saving state:", error);
		alert("An error occurred while saving the state. Please try again.");
		}
	
		// Update the savedStates state to immediately display the new saved state
		const updatedSavedStates = getSavedStates();
		setSavedStates(updatedSavedStates);
	}
  
	// Function to handle loading a saved state
	function handleLoadState(index) {
		// Check if the specified index is valid
		if (index < 0 || index >= savedStates.length) {
		console.error("Invalid index for loading state.");
		alert("Invalid index for loading state. Please try again.");
		return;
		}
	
		// Load the saved state at the specified index and update the html, css, and js states accordingly
		const stateToLoad = savedStates[index];
		setHtml(stateToLoad.html);
		setCss(stateToLoad.css);
		setJs(stateToLoad.js);
	}
  
	// Function to handle deleting a saved state
	function handleDeleteState() {
		// Check if the specified index is valid
		if (selectedStateIndex >= savedStates.length) {
		console.error("Invalid index for deleting state.");
		alert("Invalid index for deleting state. Please try again.");
		return;
		}
	
		// Confirm the deletion with the user
		const stateToDelete = savedStates[selectedStateIndex];
		const confirmDelete = window.confirm(`Are you sure you want to delete the state "${stateToDelete.name}"?`);
		if (!confirmDelete) {
		return;
		}
	
		// Delete the saved state at the specified index
		try {
		deleteState(selectedStateIndex);
		alert(`State "${stateToDelete.name}" deleted successfully!`);
		} catch (error) {
		console.error("Error deleting state:", error);
		alert("An error occurred while deleting the state. Please try again.");
		}
	
		// Update the savedStates state to immediately remove the deleted state from the UI
		const updatedSavedStates = getSavedStates();
		setSavedStates(updatedSavedStates);
	}

	// Function to handle editing the state name
	function handleEditStateName(event) {
		event.stopPropagation(); // Prevent the event from propagating to the tab click handler
		const stateToEdit = savedStates[selectedStateIndex];
		if (stateToEdit && editedStateName.trim() !== "") {
		  const isNameAlreadyTaken =
			savedStates.findIndex((state, index) => index !== selectedStateIndex && state.name === editedStateName) !== -1;
		  if (isNameAlreadyTaken) {
			alert("The name is already taken. Please choose a different name.");
			return;
		  }
	
		  // Update the saved state in local storage
		  updateStatesName(stateToEdit.name, editedStateName);
		  stateToEdit.name = editedStateName;
		  setEditedStateName("");
		  setIsEditingStateName(false);
		}
	  }

  
	return (
		<div className="App">
			
			<APIKeyDialog show={showAPIKeyDialog} loading={isCheckingAPIKey} checkAPIKeyValidity={checkAPIKeyValidity} />
			<div className="container">
				{/* Closable Column with Tabs */}
				<div className={`saved-states-panel ${showSavedStates ? "show" : ""}`}>
					<div className="tab-buttons">
						<button
						type="button"
						className="sidebar-button"
						onClick={handleSaveState}
						>
						<ion-icon name="save-outline"></ion-icon>
						</button>
						<button
						type="button"
						className="sidebar-button"
						onClick={handleDeleteState}
						disabled={selectedStateIndex === null}
						>
						<ion-icon name="trash-outline"></ion-icon>
						</button>
					</div>
					{/* Show the list of saved states in tabs */}
					<div className="tabs">
					{savedStates.map((state, index) => (
						<div
						key={index}
						className={`tab ${index === selectedStateIndex ? "selected" : ""}`}
						onClick={() => handleSelectState(index)}
						>
						{isEditingStateName && index === selectedStateIndex ? (
							<input
							type="text"
							value={editedStateName}
							onChange={(e) => setEditedStateName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleEditStateName(e);
									setIsEditingStateName(false)
								}
							}}
							onClick={(e) => e.stopPropagation()}
							autoFocus
							/>
						) : (
							<div className="tab-label">{state.name}</div>
						)}
						{/* Show the edit icon when the state is selected */}
						{index === selectedStateIndex && (
							<div className="edit-icon" onClick={() => isEditingStateName ? setIsEditingStateName(false) : setIsEditingStateName(true)}>
							<ion-icon name="create-outline"></ion-icon>
							</div>
						)}
						</div>
					))}
					</div>
					</div>
				<div className="sidebar">
				<button type="button" className="toggle-button" onClick={() => setShowSavedStates(!showSavedStates)}>
          			{showSavedStates ? <ion-icon size="large" name="chevron-back-circle-outline"/>: <ion-icon size="large" name="chevron-forward-circle-outline"/> }
        		</button>
				<button
						type="button"
						className="toggle-button"
						onClick={handleReset}
						>
						<ion-icon size="large" name="refresh-outline"></ion-icon>
				</button>
				<button
						type="button"
						className="toggle-button"
						onClick={handleCopy}
						>
						<ion-icon size="large" name="copy-outline"></ion-icon>
				</button>
				</div>
				<div>
					<Filecontext.Provider value={{ html, css, js, activeTab, setActiveTab}}>
					<TabList html={html} css={css} js={js} loadingResponse={loadingResponse} >
						<Tab key="page" label="Preview" icon="card-image" >
							<VirtualPage html={html} css={css} js={js} />
						</Tab>
						<Tab key="html" label="Elements" icon="code-slash">
							<Editor language="html" displayName="HTML" value={html} onChange={setHtml} />
						</Tab>
						<Tab key="css" label="Styles" icon="palette">
							<Editor language="css" displayName="CSS" value={css} onChange={setCss} />
						</Tab>
						<Tab key="js" label="Code" icon="braces">
							<Editor language="javascript" displayName="JS" value={js} onChange={setJs} />
						</Tab>
					</TabList>
					</Filecontext.Provider>
				</div>
				<div style={{width: "600px"}}>
					<Chat messages={messages} addMessage={addMessage} loadingResponse={loadingResponse} usedTokens={usedTokens} moneySpent={moneySpent} />
				</div>
			</div>
		</div>
	);
}


function APIKeyDialog({show, loading, checkAPIKeyValidity}) {

	function handleRequestClose(event) {
		console.log("Dialog closed");
		if (!AI.isInitialized) {
			event.preventDefault();
		}
	}

	function saveAPIKey() {
		const input = document.querySelector("sl-input");
		const new_key = input.value;
		localStorage.setItem("api_key", new_key);
		checkAPIKeyValidity();
	}

	return (
		<SlDialog open={show} label="Provide your OpenAI's API key" onSlRequestClose={handleRequestClose}>
			Provide your own OpenAI's API key to use the chatbot. <a href="https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key" target="_blank" rel="noreferrer">Where do I find my secret API key?</a>
			<div style={{marginTop: "24px"}} />
			<SlInput type="text" placeholder="sk-..." disabled={loading} />
			<SlButton slot="footer" onClick={saveAPIKey} loading={loading}>Save</SlButton>
		</SlDialog>
	);

}

export default App;
