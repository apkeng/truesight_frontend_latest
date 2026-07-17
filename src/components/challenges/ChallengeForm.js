import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUserFriends,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { getAvailableOpponents } from "../../utils/apiServices";
import Loading from "../Loading";

const Modal = ({ open, children, onClose, title, description }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-center min-h-screen py-8">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(30,41,59,0.3)] w-full max-w-2xl mx-auto relative border border-white/40 scale-in-center overflow-hidden">
          {/* Decorative Header */}
          <div className="bg-slate-900 px-10 py-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
               <FontAwesomeIcon icon={faUserFriends} className="text-9xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight mb-2 uppercase tracking-widest">{title}</h2>
              <p className="text-slate-400 font-medium text-sm max-w-xs">{description}</p>
            </div>
            <button 
              className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-20 active:scale-95 border border-white/10" 
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="p-10 relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChallengeForm = ({ isOpen, onClose, onSubmit, availableTopics, userData }) => {
  const [topic, setTopic] = useState("");
  const [challengeType, setChallengeType] = useState("async");
  const [matchingType, setMatchingType] = useState("invite");
  const [opponentSearch, setOpponentSearch] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showStudentList, setShowStudentList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (matchingType === "invite" && opponentSearch.length > 0) {
      searchStudents();
    } else {
      setAvailableStudents([]);
      setShowStudentList(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opponentSearch, matchingType]);

  const searchStudents = async () => {
    try {
      setLoadingStudents(true);
      
      // Fetch all available opponents from backend
      const opponents = await getAvailableOpponents();
      
      // Filter by search term
      const filtered = opponents.filter(
        (student) =>
          student.name?.toLowerCase().includes(opponentSearch.toLowerCase()) ||
          student.email?.toLowerCase().includes(opponentSearch.toLowerCase())
      );

      setAvailableStudents(filtered);
      setShowStudentList(filtered.length > 0);
    } catch (error) {
      console.error("Error searching students:", error);
      setAvailableStudents([]);
      setShowStudentList(false);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic) {
      alert("Please select a topic");
      return;
    }

    if (matchingType === "invite" && !selectedOpponent) {
      alert("Please select an opponent");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        topic,
        challengeType,
        matchingType,
        opponentId: selectedOpponent?.uid || null,
        opponentName: selectedOpponent?.name || null,
      });

      // Reset form
      setTopic("");
      setChallengeType("async");
      setMatchingType("invite");
      setOpponentSearch("");
      setSelectedOpponent(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <Loading message="Creating Challenge..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose} 
      title="Engage Opponent" 
      description="Select a domain and authorize an engagement with a verified peer."
    >
      <form onSubmit={handleSubmit} className="space-y-10 group">
        {/* Topic Selection */}
        <div className="space-y-4">
           <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Academic Domain</label>
           <div className="relative group/select">
             <select
               value={topic}
               onChange={(e) => setTopic(e.target.value)}
               className="w-full h-16 px-6 rounded-2xl border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-[10px] focus:ring-blue-600/5 appearance-none cursor-pointer shadow-inner"
               required
             >
               <option value="">Select Domain...</option>
               {availableTopics && availableTopics.length > 0 ? (
                 availableTopics.map((topicName, index) => (
                   <option key={index} value={topicName}>
                     {topicName}
                   </option>
                 ))
               ) : null}
             </select>
             <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-slate-400 group-focus-within/select:text-blue-600 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </div>
           </div>
           {(!availableTopics || availableTopics.length === 0) && (
             <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-2">
               No active research domains found. Populate your roadmap first.
             </p>
           )}
        </div>

        {/* Opponent Selection */}
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Search User</label>
          <div className="relative group/search">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-600 transition-colors">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <input
              type="text"
              value={opponentSearch}
              onChange={(e) => setOpponentSearch(e.target.value)}
              placeholder="Search by name or administrative email..."
              className="w-full h-16 pl-14 pr-6 rounded-2xl border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-[10px] focus:ring-blue-600/5 shadow-inner"
            />

            {/* Student List Dropdown */}
            {showStudentList && (
              <div className="absolute z-20 w-full mt-3 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl max-h-72 overflow-y-auto no-scrollbar p-2 scale-in-center">
                {loadingStudents ? (
                  <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Registry...</div>
                ) : availableStudents.length > 0 ? (
                  availableStudents.map((student) => (
                    <button
                      key={student.uid}
                      type="button"
                      onClick={() => {
                        setSelectedOpponent(student);
                        setOpponentSearch(student.name);
                        setShowStudentList(false);
                      }}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between group/item mb-1 ${
                        selectedOpponent?.uid === student.uid ? "bg-blue-600 text-white" : "hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-black uppercase tracking-wider ${selectedOpponent?.uid === student.uid ? 'text-white' : 'text-slate-900'}`}>{student.name}</div>
                        <div className={`text-[10px] font-medium ${selectedOpponent?.uid === student.uid ? 'text-blue-100' : 'text-slate-400'}`}>{student.email}</div>
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedOpponent?.uid === student.uid ? 'bg-white/20' : 'bg-slate-100 group-hover/item:bg-blue-100 group-hover/item:text-blue-600'}`}>
                        <FontAwesomeIcon icon={faUserFriends} className="text-[10px]" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">No matched records found.</div>
                )}
              </div>
            )}
          </div>

          {selectedOpponent && (
            <div className="mt-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between group/sel animate-in slide-in-from-top-2 duration-300">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-lg shadow-blue-200">
                    <FontAwesomeIcon icon={faUserFriends} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-900 uppercase tracking-wider">{selectedOpponent.name}</p>
                    <p className="text-[10px] font-bold text-blue-600 opacity-60 uppercase tracking-widest">{selectedOpponent.email}</p>
                  </div>
               </div>
               <button
                 type="button"
                 onClick={() => {
                   setSelectedOpponent(null);
                   setOpponentSearch("");
                 }}
                 className="w-10 h-10 rounded-full flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-white transition-all active:scale-90"
               >
                 <FontAwesomeIcon icon={faTimes} />
               </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-16 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            Abort
          </button>
          <button
            type="submit"
            className="flex-3 h-16 px-10 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-slate-200 hover:bg-blue-600 hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0"
            disabled={!topic || !selectedOpponent}
          >
            Authorize Challenge
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChallengeForm;
