import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import NoteCard from '../../components/Cards/NoteCard';
import { MdAdd } from 'react-icons/md';
import AddEditNotes from './AddEditNotes';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../../components/ToastMessage/Toast';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import AddNotesImg from '../../assets/images/addnotes.png';
import NoDataImg from '../../assets/images/no-data.png';
//import axiosInstance from '../../utils/axiosInstance';



const Home = () => {
  
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: '',
    type: '',
  });


  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([])

  const [isSearch, setIsSearch] = useState(false)

  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  
  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: noteDetails })
  }

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };
  
  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
      type: "",
    });
  };

  // Get User Info
  const getUserInfo = async () => {
    // console.log('Token:', token);
    try {
       const headers= {
        Authorization: `Bearer ${token}`
      }
      const response = await axios.get("http://localhost:5001/get-user", {headers});
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
  
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };


  // Get all Notes
  const getAllNotes = async () => {
    
    // console.log('Token:', token);
    try {
       const headers= {
        Authorization: `Bearer ${token}`
      }
      const response = await axios.get("http://localhost:5001/get-all-notes", {headers});

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);

      }
      console.log(response)
    } catch (error) {
      console.log("An error occurred. Please try again.");
    }
  };

  // Delete Note
  const deleteNote = async(data) => {
    const noteId = data._id

    try {
       
        
        const headers = {
            Authorization: `Bearer ${token}`
        }
        
        const response = await axios.delete("http://localhost:5001/delete-note/" + noteId, {headers});

        
        if (response.data && !response.data.error) {
            showToastMessage("Notes Deleted Successfully", 'delete')
            getAllNotes()
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          console.log("An error occurred. Please try again.");
        }
    }
  }

  // Search for a note
  const onSearchNote = async(query) => {
    

    try {
       
        
        const headers = {
            Authorization: `Bearer ${token}`
        }
        
        const response = await axios.get("http://localhost:5001/search-notes" , {
          headers,
          params: {query},
          
        });

        
        if (response.data && response.data.notes) {
            setIsSearch(true);
            setAllNotes(response.data.notes)
        }
    } catch (error) {
        console.log("An error occurred. Please try again.");
    
    }
  };

  // Pinned Note
  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id

    try {
      const headers = {
        Authorization: `Bearer ${token}`
      }

      const Pinned = {
        isPinned: !noteData.isPinned
      }

      const response = await axios.put("http://localhost:5001/update-note-pinned/" + noteId, Pinned, {headers});
      
      if (response.data && response.data.note) {
        showToastMessage("Note Pinned Successfully");
        getAllNotes();
      }
    } catch (error) {
      console.log(error)
    }
  }




  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  }

  


  useEffect (() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);


  return (
    <div>

        <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />

        <div className='container mx-auto'>
          {allNotes.length > 0 ? (
            <div className='grid grid-cols-3 gap-4 mt-8'>
            {allNotes.map((item) => (
              <NoteCard 
                key={item._id}
                title={item.title} 
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={()=> handleEdit(item)}
                onDelete={()=> deleteNote(item)}
                onPinNote={()=> updateIsPinned(item)}
              />
            ))}
          </div> ) : (
            <EmptyCard 
              imgSrc={isSearch ? NoDataImg : AddNotesImg} 
              message={isSearch 
                ? `Oops! No note found marching your search.`
                : `Start creating your first note! Click 'Add' button to join thoughts and ideas. Let's get started!`
              }
            />
          )}
        
        </div>

        <button 
          className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover: bg-blue-600 absolute right-10 bottom-10' 
          onClick={() => {
            setOpenAddEditModal({ isShown: true, type: "add", data: null });
          }}
        >
          <MdAdd className='text-[32px] text-white'/>
        </button>

        <Modal 
          isOpen={openAddEditModal.isShown}
          onRequestClose={() =>{ setOpenAddEditModal({ isShown: false, type: "add", data: null })}}
          style={{
            overlay: {
              backgroundColor: "rgba(0,0,0,0.2)"
            },
          }}
          contentLabel=""
          className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
        >
        
          <AddEditNotes 
            type={openAddEditModal.type}
            noteData={openAddEditModal.data}
            onClose={()=>{
            setOpenAddEditModal({ isShown: false, type: "add", date: null });
          }}
            getAllNotes={getAllNotes}
            showToastMessage={showToastMessage}
          />
          

        </Modal>

        <Toast 
          isShown={showToastMsg.isShown}
          message={showToastMsg.message}
          type={showToastMsg.type}
          onClose={handleCloseToast}
        />
    
    </div>
  )
}

export default Home