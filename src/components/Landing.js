import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropDown";
import { saveAs } from 'file-saver';

const javascriptDefault =
  `// Write your C++ code here 
#include <iostream>

int main() {
    std::cout << "Hello World!";
    return 0;
}`;

const Landing = () => {
  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[5]);
  const [fileContent, setFileContent] = useState(null);
  const [upload, setUpload] = useState(0);
  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);
  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };
  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: language.id,
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key":
          "26f397d828msh57887dad54691fap13b5e9jsnd60485118279",
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);
          showErrorToast(
            `Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!`,
            10000
          );
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: "https://judge0-ce.p.rapidapi.com/submissions" + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": "eb0d3364bemsh928cad1305d8905p13986bjsn7357710f69cd",
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      if (statusId === 1 || statusId === 2) {
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        showSuccessToast(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const showErrorToast = (msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);
    };

    reader.readAsText(file);
  };

  // useEffect(() => {
  //   if (fileContent) {
  //     setCode(fileContent);
  //   }
  // }, [fileContent]);

  const handleFileSubmit = () => {
    setCode(fileContent);
    setUpload(1);
    // onchange('code', code);
    // console.log("fileContent", code);
  };

  const handleCheck = () => {
    const formData = new FormData();
    formData.append('file', new Blob([code], { type: 'text/php' }), 'code.php');

    axios.post('/upload', formData)
      .then((res) => {
        // Handle the response
      })
      .catch((err) => {
        // Handle the error
      });
  };

  const handleDownload = () => {
    axios.get('')
      .then((res) => {
        const blob = new Blob([res.data], { type: 'text/php' });
        saveAs(blob, 'code.php');
      });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="h-4 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="flex flex-row">
        <div className="px-4 py-2">
          <LanguagesDropdown onSelectChange={onSelectChange} />
        </div>
        <div className="px-4 py-2">
          <ThemeDropdown
            handleThemeChange={handleThemeChange}
            theme={theme}
          />
        </div>
        <div className="pl-10 py-2">
          {/* <input type="file" onChange={handleFileChange} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:text-black border border-blue-500 hover:border-transparent rounded" /> */}
          <label class="block">
            {/* <span class="sr-only">Choose profile photo</span> */}
            <input type="file" class="block w-full text-sm text-slate-500
                file:mr-4 file:py-3 file:px-6
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
              onChange={handleFileChange}
            />
          </label>

        </div>

        <div className="py-2">
          <button onClick={handleFileSubmit} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent rounded">Submit</button>
        </div>

      </div>
      <div className="flex flex-row space-x-4 items-start px-4 py-4">
        <div className="flex flex-col w-full h-full justify-start items-end">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
            upload={upload}
          />
        </div>

        <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
          <OutputWindow outputDetails={outputDetails} />
          <div className="flex flex-col items-end">
            <CustomInput
              customInput={customInput}
              setCustomInput={setCustomInput}
            />

            <div>

              <button
                onClick={handleCompile}
                disabled={!code}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:text-black mt-5 py-2 px-4 border border-blue-500 hover:border-transparent rounded mr-10"
                
              >
                {processing ? "Processing..." : "Compile and Execute"}
              </button>
              <button onClick={handleCheck}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:text-black mt-5 py-2 px-4 border border-blue-500 hover:border-transparent rounded"
              >Check</button>

            </div>



            <button onClick={handleDownload} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:text-black mt-5 py-2 px-4 border border-blue-500 hover:border-transparent rounded">download</button>
          </div>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
    </>
  );
};
export default Landing;