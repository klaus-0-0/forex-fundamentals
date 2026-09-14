import axios from 'axios';
import config from '../config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [economic_Activites, seteconomic_Activites] = useState(['', '', '', '', '']);
    const [topData, setTopData] = useState(['', '', '', '', '']);
    const [BullishBias, setBullishBias] = useState(['', '', '', '', '']);
    const [BearishBias, setBearishBias] = useState(['', '', '', '', '']);
    const [notes, setnotes] = useState<string>("");

    const [selectSlot, setSelectSlot] = useState("");
    const [inputVal, setInputVal] = useState("");
    const [button_pressed, setButton_pressed] = useState<number[]>([]);
    const [Bar, setBar] = useState<string>("attack");

    const navigate = useNavigate();
    const [userData] = useState(() => {
        const stored = localStorage.getItem("userData");
        return stored ? JSON.parse(stored) : null;
    });

    const email = userData?.email ?? "";
    const userId = userData?.id ?? "";

    useEffect(() => {
        const count = () => {
            const length = button_pressed.length;

            if (length < 2) {
                setBar("attack");
            } else if (length === 2) {
                setBar("defence");
            } else if (length === 4) {
                setBar("cautious");

            }
        }
        count();
        console.log("button_pressed:", button_pressed);

    }, [button_pressed])

    const handle_economic_Activites = () => {
        economic_Activites.forEach((_, idx) => {
            if (Number(selectSlot) === idx) {
                const newData = [...economic_Activites];
                newData[idx] = inputVal;
                seteconomic_Activites(newData);
                setInputVal("");
            }
        })
    }
    const handle_Send = () => {
        topData.forEach((_, idx) => {
            if (Number(selectSlot) === idx) {
                const newData = [...topData];
                newData[idx] = inputVal;
                setTopData(newData);
                setInputVal("");
            }
        })
    }

    const handle_Bullish = () => {
        BullishBias.forEach((_, idx) => {
            if (Number(selectSlot) === idx) {
                const newData = [...BullishBias];
                newData[idx] = inputVal;
                setBullishBias(newData);
                setInputVal("");
            }
        })
    }
    const handle_Bearish = () => {
        BearishBias.forEach((_, idx) => {
            if (Number(selectSlot) === idx) {
                const newData = [...BearishBias];
                newData[idx] = inputVal;
                setBearishBias(newData);
                setInputVal("");
            }
        })
    }

    const attack_Defence = (num: number) => {
        setButton_pressed(prev => {
            // Check if this number already exists in the array
            if (prev.includes(num)) {
                // If exists, remove it (subtract)
                return prev.filter(val => val !== num);
            } else {
                // If doesn't exist, add it (add)
                return [...prev, num];
            }
        });
        // count();
        console.log(Bar);
    }

    const postData = async () => {
        try {
            const send = await axios.post(`${config.apiUrl}/data`, {
                notes,
                economic_Activites,
                topData,
                BullishBias,
                BearishBias,
                email,
                userId,
                button_pressed
            })
            if (send) {
                console.log(send);

            }
        } catch (err) {
            console.error(err, "server error");
        }
    }

    // const handleNotes = async () => {
    //     try {
    //         const postnotes = await axios.post(`${config.apiUrl}/notes`, {
    //             notes
    //         })
    //         if (postnotes) {
    //             console.log("notes: ", postnotes);
    //         }
    //     } catch (err) {
    //         console.error(err);
    //     }
    // }

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await axios.get(`${config.apiUrl}/getdata`, {
                    params: { userId }
                })
                if (!data) {
                    console.log("no data found");
                } else {
                    console.log("notes", data);
                    const old_Top_data = [...topData];
                    const old_bullishBias_data = [...BullishBias];
                    const old_bearishBias_data = [...BearishBias];
                    const old_button_pressed = [...button_pressed];
                    const old_economic_Activites = [...economic_Activites];

                    // console.log("olddaata: ", old_Top_data);
                    for (let i = 0; i < data.data.topEvents.length; i++) {
                        old_Top_data[i] = data.data.topEvents[i];
                    }
                    for (let i = 0; i < data.data.bullishBias.length; i++) {
                        old_bullishBias_data[i] = data.data.bullishBias[i];
                    }
                    for (let i = 0; i < data.data.bearishBias.length; i++) {
                        old_bearishBias_data[i] = data.data.bearishBias[i];
                    }
                    for (let i = 0; i < data.data.button_pressed.length; i++) {
                        old_button_pressed[i] = data.data.button_pressed[i];
                    }
                    for (let i = 0; i < data.data.economic_Activites.length; i++) {
                        old_economic_Activites[i] = data.data.economic_Activites[i];
                    }
                    setTopData(old_Top_data);
                    setBullishBias(old_bullishBias_data);
                    setBearishBias(old_bearishBias_data);
                    setnotes(data.data.notes);
                    setButton_pressed(old_button_pressed);
                    seteconomic_Activites(old_economic_Activites);
                }

            } catch (err) {
                console.error(err, "server error");
            }
        }
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handle_logout = ()=>{
        localStorage.removeItem("userData");
        navigate("/login");
    }

    return (
        <div className={`min-h-screen ${Bar === "attack" ? 'bg-linear-to-br from-green-700 via-black to-green-900' :
            Bar === "defence" ? 'bg-linear-to-br from-red-800 via-black to-red-900' :
                Bar === "cautious" ? 'bg-linear-to-br from-purple-700 via-black to-purple-900 ' : ""
            }`}>
            <nav
                className={`sticky top-0 z-50 flex items-center justify-between gap-x-6
    font-bold text-black text-2xl p-2 border-b-2 border-gray-900
    ${Bar === "attack"
                        ? "bg-linear-to-br from-emerald-800 via-emerald-900 bg-emerald-950 shadow-2xl"
                        : Bar === "defence"
                            ? "bg-linear-to-br from-red-900 via-red-900 to-pink-950 shadow-2xl"
                            : Bar === "cautious"
                                ? "bg-linear-to-br from-purple-800 via-purple-900 to-purple-950 shadow-2xl"
                                : ""
                    }`}
            >
                <span>Forex</span>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => postData()}
                        className="px-4 py-2 text-sm font-medium text-white
                                   rounded-lg shadow-md transition-all duration-200
                                 hover:bg-gray-700 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        Save
                    </button>

                    <button
                        onClick={() => handle_logout()}
                        className="px-4 py-2 text-sm font-medium text-white
                                   rounded-lg shadow-md transition-all duration-200
                                 hover:bg-gray-700 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Notes */}
            <div className='flex flex-col items-center mt-10 gap-3'>
                <p className='text-xl font-bold text-gray-200'>Notes</p>
                <div className='bg-gray-900 min-h-50 w-2/3 rounded-xl p-4 shadow-2xl'>
                    <ul className='list-disc list-inside space-y-2 text-lg text-gray-200'>
                        {notes.split("\\n").map((line, idx) => (
                            line.trim() && <li key={idx} className=''>{line}</li>
                        ))}
                    </ul>
                </div>
                <div className='flex items-center justify-center gap-2 '>
                    <input onChange={(e) => setnotes(e.target.value)} className='w-3/2 h-10 bg-amber-50 rounded-xl'></input>
                    {/* <button onClick={() => handleNotes()}
                        className='p-2 bg-blue-800 rounded-xl cursor-pointer transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-lg'>save</button> */}
                </div>
            </div>

            {/* Current Economic Activities */}
            <div className='flex flex-col items-center justify-center bg-transparent'>
                <p className='mt-10 text-3xl font-bold text-gray-400 text-border-black'>USA Economic Activities</p>
                <div className='w-4/5 min-h-130 h-auto flex flex-col items-center justify-between gap-1 mt-5'>
                    {economic_Activites.map((val, idx) => (
                        <div key={idx} className='flex items-start w-full gap-2'>
                            <p className=' text-gray-200 min-h-10 border-b-2 flex-1 wrap-anywhere whitespace-pre-wrap'>
                                {val}
                            </p>
                        </div>
                    ))}

                    <div className='flex gap-2'>
                        <select onChange={(e) => {
                            const val = e.target.value;
                            setSelectSlot(val)
                        }}
                            className='bg-white rounded-xl'>
                            {/* <option value={""}>select</option> */}
                            {[0, 1, 2, 3, 4].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <input
                            value={inputVal}
                            type='text'
                            placeholder='write you thoughts here'
                            onChange={(e) => {
                                setInputVal(e.target.value)
                            }}
                            onKeyDown={(e) => e.key == "Enter" && handle_economic_Activites()}
                            className='bg-white w-3/2 rounded-xl text-center'>
                        </input>
                        <button onClick={() => handle_economic_Activites()} className='p-2 bg-blue-800 rounded-xl cursor-pointer transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-lg'>
                            send</button>
                    </div>
                </div>
            </div>

            {/* Top fundamental data */}
            <div className='flex flex-col items-center justify-center bg-transparent'>
                <p className='mt-10 text-3xl font-bold text-gray-400'>Top Macros & Events</p>
                <div className='w-4/5 min-h-130 h-auto flex flex-col items-center justify-between gap-1 mt-5'>
                    {topData.map((val, idx) => (
                        <div key={idx} className='flex items-start w-full gap-2'>
                            <p className=' text-gray-200 min-h-10 border-b-2 flex-1 wrap-anywhere whitespace-pre-wrap'>
                                {val}
                            </p>
                            <button
                                onClick={() => attack_Defence(idx + 1)}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-300 shrink-0 cursor-pointer
                               ${button_pressed.includes(idx + 1) ? 'bg-green-500' : 'bg-gray-500'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full 
                                                  transition-transform duration-300 ease-in-out shadow-md
                                                ${button_pressed.includes(idx + 1) ? 'translate-x-7' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                    ))}

                    <div className='flex gap-2'>
                        <select onChange={(e) => {
                            const val = e.target.value;
                            setSelectSlot(val)
                        }}
                            className='bg-white rounded-xl'>
                            {/* <option value={""}>select</option> */}
                            {[0, 1, 2, 3, 4].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <input
                            value={inputVal}
                            type='text'
                            placeholder='write you thoughts here'
                            onChange={(e) => {
                                setInputVal(e.target.value)
                            }}
                            onKeyDown={(e) => e.key == "Enter" && handle_Send()}
                            className='bg-white w-3/2 rounded-xl text-center'>
                        </input>
                        <button onClick={() => handle_Send()} className='p-2 bg-blue-800 rounded-xl cursor-pointer transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-lg'>
                            send</button>
                    </div>
                </div>
            </div>

            {/* Attack & Defence Bar*/}
            <div className='flex items-center justify-center mt-3'>
                <div className={`h-20 w-3/4 border-4 flex items-center justify-center
                 ${Bar === "attack" ? "border-green-500" :
                        Bar === "defence" ? "border-red-500" :
                            Bar === "cautious" ? "border-purple-500" :
                                "border-gray-500"}`}
                >
                    <p className={`${Bar === "attack" ? "text-green-500" : ""}`}>{Bar === "attack" ? "Attack Mode On" : ""}</p>
                    <p className={`${Bar === "defence" ? "text-red-500" : ""}`}>{Bar === "defence" ? "Defence Mode - On if data is mixed can conolidate" : ""}</p>
                    <p className={`${Bar === "cautious" ? "text-purple-500" : ""}`}>{Bar === "cautious" ? "Change your Prespective " : ""}</p>
                </div>
            </div>

            <div className='flex flex-col items-center justify-center mt-4 w-full'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-4/5'>
                    {/* Bullish */}
                    <div className='flex flex-col gap-2 h-auto'>
                        <h3 className='text-green-400 font-bold text-center'>📈 Bullish-Bias  What_Could_Flip</h3>
                        {BullishBias.map((val, idx) => (
                            <p key={idx} className='rounded-2xl text-gray-200 min-h-20 h-auto bg-gray-800 p-2 wrap-break-word whitespace-pre-wrap'>
                                {val || ""}
                            </p>
                        ))}

                        <div className='flex gap-3 mt-3'>
                            <select onChange={(e) => {
                                const val = e.target.value;
                                setSelectSlot(val)
                            }}
                                className='bg-white rounded-xl'>
                                {/* <option value={""}>select</option> */}
                                {[0, 1, 2, 3, 4].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            <input
                                value={inputVal}
                                type='text'
                                placeholder='write you thoughts here'
                                onChange={(e) => {
                                    setInputVal(e.target.value)
                                }}
                                onKeyDown={(e) => e.key == "Enter" && handle_Bullish()}
                                className='bg-white w-3/2 rounded-xl text-center'>
                            </input>
                            <button onClick={() => handle_Bullish()} className='p-2 bg-blue-800 rounded-xl cursor-pointer transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-lg'>
                                send</button>
                        </div>
                    </div>

                    {/* Bearish */}
                    <div className='flex flex-col gap-2'>
                        <h3 className='text-red-400 font-bold text-center'>📉 Bearish-Bias What_could_Flip</h3>
                        {BearishBias.map((val, idx) => (
                            <p key={idx} className=' rounded-2xl text-gray-200 min-h-20 bg-gray-800 p-2 wrap-break-word whitespace-pre-wrap'>
                                {val || ""}
                            </p>
                        ))}
                        <div className='flex gap-3 mt-3'>
                            <select onChange={(e) => {
                                const val = e.target.value;
                                setSelectSlot(val)
                            }}
                                className='bg-white rounded-xl'>
                                {/* <option value={""}>select</option> */}
                                {[0, 1, 2, 3, 4].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            <input
                                value={inputVal}
                                type='text'
                                placeholder='write you thoughts here'
                                onChange={(e) => {
                                    setInputVal(e.target.value)
                                }}
                                onKeyDown={(e) => e.key == "Enter" && handle_Bearish()}
                                className='bg-white w-3/2 rounded-xl text-center'>
                            </input>
                            <button onClick={() => handle_Bearish()} className='p-2 bg-blue-800 rounded-xl cursor-pointer transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-lg'>
                                send</button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className='min-h-screen'>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;