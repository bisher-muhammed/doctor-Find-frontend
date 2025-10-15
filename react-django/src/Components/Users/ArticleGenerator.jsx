// ArticleGenerator.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  Alert,
  CardMedia
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ArticleGenerator = () => {
  const [article, setArticle] = useState("");
  const [topic, setTopic] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("access"); // Changed from "access_token" to "access"
    console.log('token....', token);
    
    if (!token) {
      setIsAuthenticated(false);
      setError("Please log in to generate articles.");
    } else {
      setIsAuthenticated(true);
      fetchArticle();
    }
  }, []);

  const fetchArticle = async () => {
    const token = localStorage.getItem("access"); // Changed from "access_token" to "access"
    
    if (!token) {
      setError("Please log in to generate articles.");
      setIsAuthenticated(false);
      return;
    }

    setLoading(true);
    setError("");
    setExpanded(false);
    setImage(null);
    
    try {
      const response = await axios.get(
        `${baseURL}/api/articles/generate-article/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("API response:", response.data);

      setArticle(response.data.article);
      setTopic(response.data.topic);
      
      // Handle image if available
      if (response.data.image && response.data.image.data) {
        const imageUrl = `data:${response.data.image.mime_type};base64,${response.data.image.data}`;
        setImage(imageUrl);
      } else if (response.data.image_note) {
        console.log("Image note:", response.data.image_note);
      }
      
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        setIsAuthenticated(false);
        localStorage.removeItem("access"); // Changed
        localStorage.removeItem("refresh"); // Changed
        localStorage.removeItem("userid");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(err.response?.data?.details || "Failed to fetch article. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated && !loading) {
    return (
      <Card sx={{ maxWidth: "900px", margin: "24px auto", p: 3, borderRadius: 4, boxShadow: 6 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3} py={4}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            You need to be logged in to generate health articles.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleLoginRedirect}
          >
            Go to Login
          </Button>
        </Box>
      </Card>
    );
  }

  const snippetLength = 500;
  const displayText = expanded 
    ? article 
    : article.slice(0, snippetLength) + (article.length > snippetLength ? "..." : "");

  return (
    <Card sx={{ maxWidth: "900px", margin: "24px auto", p: 3, borderRadius: 4, boxShadow: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          {topic ? `Topic: ${topic}` : "Generating Article..."}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchArticle}
          disabled={loading}
        >
          Generate New Article
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && article && (
        <>
          {/* Display image if available */}
          {image && (
            <CardMedia
              component="img"
              image={image}
              alt={`Illustration for ${topic}`}
              sx={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: 2,
                mb: 3,
              }}
            />
          )}

          <CardContent
            sx={{
              maxHeight: expanded ? "none" : "400px",
              overflowY: expanded ? "visible" : "hidden",
            }}
          >
            {displayText.split("\n").map((line, idx) => {
              if (line.startsWith("### ")) {
                return (
                  <Typography key={idx} variant="h6" fontWeight="medium" mt={2} mb={1}>
                    {line.replace("### ", "")}
                  </Typography>
                );
              } else if (line.startsWith("## ")) {
                return (
                  <Typography key={idx} variant="h5" fontWeight="bold" mt={3} mb={1}>
                    {line.replace("## ", "")}
                  </Typography>
                );
              } else if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <Typography key={idx} variant="subtitle1" fontWeight="bold" mt={2} mb={1}>
                    {line.replace(/\*\*/g, "")}
                  </Typography>
                );
              } else if (line.startsWith("*") || line.startsWith("-")) {
                return (
                  <Typography key={idx} component="li" sx={{ ml: 3, mb: 0.5 }}>
                    {line.replace(/^[-*]\s?/, "")}
                  </Typography>
                );
              } else if (line.startsWith(">")) {
                return (
                  <Box
                    key={idx}
                    sx={{
                      borderLeft: "4px solid #1976d2",
                      pl: 2,
                      fontStyle: "italic",
                      mb: 2,
                      color: "text.secondary",
                    }}
                  >
                    {line.replace("> ", "")}
                  </Box>
                );
              } else if (line.trim() === "") {
                return <Box key={idx} sx={{ height: "8px" }} />;
              } else {
                return (
                  <Typography key={idx} paragraph>
                    {line}
                  </Typography>
                );
              }
            })}
          </CardContent>

          {article.length > snippetLength && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Read Less" : "Read More"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Card>
  );
};

export default ArticleGenerator;