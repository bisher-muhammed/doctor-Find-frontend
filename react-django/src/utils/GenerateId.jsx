const randomID = (len = 5) => {
    let result = "";
    const chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };


  
  const handlePhoneClick = () => {
    const callId = randomID(); // Generate random ID for the call
    setCallId(callId)
    if (callId) {
      socket.current.emit("audio_call", {
        callId,
        sender_id:user.current,
        
        room_id: roomId,
        content: "Calling"
      });
      navigate(`/audioCall/${roomId}/${callId}`);
    };
    
    }

  const handleAcceptCall = () => { 
    if (callId){
      socket.current.emit("audio_call", {
        callId,
        sender_id: user, // Shop accepting the call
        
        room_id: roomId,
        content: "call_accepted"
      });
      navigate(`/audioCall/${roomId}/${callId}`);
    };
    }

  

  const handleDeclineCall = () => {
    socket.current.emit("audio_call", {
      content: "call_declined",
      sender_id: user,
      
      room_id: roomId
    });
    setShowModal(false);
  };

  useEffect(() => {
    if (!socket.current) return;
  
    const handleAudioMessage = (data) => {
      console.log('the data comming to the handle message',data)

          // Check if the current user/shop is the receiver
    if (data.message === "Calling" && data.receiver_id === user) {
      setCallId(data.callId);
      // Show the incoming call modal
      setShowModal(true);
    } 

    if (data.message === "call_declined" && data.receiver_id === user) {
      alert("The call was declined.");
      setShowModal(false);
    }
    };
  
    socket.current.on("receive_message", handleAudioMessage);
  
    return () => {
      socket.current.off("receive_message", handleAudioMessage); // Cleanup listener
    };
  }, [user]);