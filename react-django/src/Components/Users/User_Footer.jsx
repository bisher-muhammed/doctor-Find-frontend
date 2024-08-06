import React from "react";

function User_Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} FIND Doctor. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default User_Footer;


