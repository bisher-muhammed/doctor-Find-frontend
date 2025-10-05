// ArticleGenerator.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Button, Box, CircularProgress } from "@mui/material";

const ArticleGenerator = () => {
  const [article, setArticle] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

  const fetchArticle = async () => {
    setLoading(true);
    setError("");
    setExpanded(false);
    try {
      const response = await axios.get(
        `${baseURL}/api/articles/generate-article/`
      );
      console.log("API response:", response.data);

      setArticle(response.data.article);
      setTopic(response.data.topic);
    } catch (err) {
      setError(err.response?.data?.details || "Failed to fetch article. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, []);

  const snippetLength = 500;
  const displayText = expanded ? article : article.slice(0, snippetLength) + (article.length > snippetLength ? "..." : "");

  return (
    <Card sx={{ maxWidth: "900px", margin: "24px auto", p: 3, borderRadius: 4, boxShadow: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          {topic ? `Topic: ${topic}` : "Generating Article..."}
        </Typography>
        <Button variant="contained" color="primary" onClick={fetchArticle}>
          Generate New Article
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" variant="body1">
          {error}
        </Typography>
      )}

      {!loading && !error && article && (
        <>
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
              <Button variant="outlined" color="secondary" onClick={() => setExpanded(!expanded)}>
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

