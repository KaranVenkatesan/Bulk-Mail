import { useState } from "react";
import * as XLSX from "xlsx";

function App() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  function handleMsg(evt) {
    setMsg(evt.target.value);
  }

  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (evt) {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const emailList = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
        const totalEmail = emailList.map(function (item) {
          return item.A;
        });

        setEmailList(totalEmail);
        showNotification(`Loaded ${totalEmail.length} emails`, "success");
      } catch (error) {
        showNotification("Error processing file", "error");
      }
    };

    reader.readAsBinaryString(file);
  }

  function showNotification(message, type) {
    setNotification({ show: true, message, type });
    
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  }

  function send() {
    if (!msg.trim()) {
      showNotification("Please enter a message", "error");
      return;
    }
    
    if (emailList.length === 0) {
      showNotification("Please upload an email list", "error");
      return;
    }
    
    setStatus(true);
    
    fetch("http://localhost:5000/sendemail", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ msg: msg, emailList: emailList })
    })
    .then(response => response.json())
    .then(data => {
      if(data === true) {
        showNotification("Emails sent successfully!", "success");
      } else {
        showNotification("Failed to send emails", "error");
      }
      setStatus(false);
    })
    .catch(error => {
      showNotification("Failed to send emails", "error");
      setStatus(false);
    });
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md ${
          notification.type === "success" 
            ? "bg-green-500 text-white" 
            : "bg-red-500 text-white"
        }`}>
          <p>{notification.message}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">BulkMail</h1>
        <p className="mt-1">Send multiple emails at once</p>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Email Message</h2>
          <textarea 
            onChange={handleMsg} 
            value={msg}
            className="w-full h-32 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:border-blue-500"
            placeholder="Type your email message here..."
          ></textarea>
        </div>

        <div className="bg-white rounded shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Upload Email List</h2>
          <input 
            onChange={handleFile} 
            type="file" 
            accept=".xlsx,.xls"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="mt-2 text-gray-600 text-sm">Upload an Excel file with email addresses</p>
        </div>

        {emailList.length > 0 && (
          <div className="bg-white rounded shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold">Email Count</h2>
            <p className="text-gray-700">Total emails: <span className="font-semibold text-blue-600">{emailList.length}</span></p>
          </div>
        )}

        <button 
          onClick={send} 
          disabled={status}
          className={`w-full py-3 rounded font-medium ${
            status 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {status ? "Sending..." : "Send Emails"}
        </button>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 p-4 text-center text-gray-600 text-sm">
        <p>© 2025 BulkMail</p>
      </footer>
    </div>
  );
}

export default App;