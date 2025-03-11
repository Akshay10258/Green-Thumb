import React, { useState, useEffect } from "react";
import { collection, query, getDocs, addDoc, doc, orderBy, Timestamp } from "firebase/firestore";
import { db, useFirebase } from "../context/Firebase";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ about: "", imageFile: null });
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const firebase = useFirebase();
  const currentUser = firebase.currentUser;
  const currentUserEmail = currentUser ? currentUser.email : "currentuser@example.com";
  const currentUsername = currentUser ? currentUser.displayName || currentUser.email : "currentUser";

  // Fetch all posts on component mount, sorted by createdAt in descending order
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const postsCollection = collection(db, "overallPosts");
        const q = query(postsCollection, orderBy("createdAt", "desc")); // Sort by createdAt in descending order
        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Fetch comments for each post
        const postsWithComments = await Promise.all(
          postsData.map(async (post) => {
            const commentsCollection = collection(db, "overallPosts", post.id, "comments");
            const commentSnapshot = await getDocs(commentsCollection);
            const commentsData = commentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            return { ...post, comments: commentsData };
          })
        );

        setPosts(postsWithComments);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    try {
      const postRef = doc(db, "overallPosts", postId);
      const commentsCollection = collection(postRef, "comments");

      // Add the comment to Firestore
      const commentRef = await addDoc(commentsCollection, {
        comment: commentText,
        email: currentUserEmail,
        createdAt: new Date(),
      });

      // Create a new comment object
      const newComment = {
        id: commentRef.id, // Firestore-generated ID
        comment: commentText,
        email: currentUserEmail,
        createdAt: new Date(),
      };

      // Update the local state to include the new comment
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [newComment, ...post.comments] } // Add new comment at the top
            : post
        )
      );
    } catch (error) {
      console.error("Error adding comment to Firestore:", error);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.about.trim()) return;
    try {
      // Add the new post to Firestore
      const docRef = await addDoc(collection(db, "overallPosts"), {
        about: newPost.about,
        mediaUrl: newPost.imageFile || "",
        mediaType: newPost.imageFile ? "image" : "text",
        username: currentUsername,
        comments: [],
        createdAt: Timestamp.now(), // Use Firestore timestamp
      });

      // Update the UI immediately by adding the new post to the top of the posts array
      const newPostData = {
        id: docRef.id,
        about: newPost.about,
        mediaUrl: newPost.imageFile || "",
        mediaType: newPost.imageFile ? "image" : "text",
        username: currentUsername,
        comments: [],
        createdAt: new Date(), // Use JavaScript Date for local display
      };

      setPosts((prevPosts) => [newPostData, ...prevPosts]); // Add new post at the top
      setNewPost({ about: "", imageFile: null }); // Reset the new post form
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setNewPost({ ...newPost, imageFile: event.target.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black/55 backdrop-blur-md text-white p-8 w-full mx-auto font-mono text-sm">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-green-500 text-center font-smooch">Community Feed</h1>
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <div className="w-full lg:w-1/4 bg-gray-900 p-4 rounded-lg shadow-lg">
              <div className="relative w-full pt-[100%] bg-gray-800 rounded-lg overflow-hidden mb-4">
                {newPost.imageFile ? (
                  <img src={newPost.imageFile} alt="New Post" className="absolute top-0 left-0 w-full h-full object-cover" />
                ) : (
                  <label className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-400 cursor-pointer">
                    Add Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <textarea
                placeholder="About this post..."
                className="w-full h-24 bg-gray-800 text-white p-2 rounded-lg focus:outline-none"
                value={newPost.about}
                onChange={(e) => setNewPost({ ...newPost, about: e.target.value })}
              />
              <button onClick={handlePostSubmit} className="w-full bg-green-500 text-black px-4 py-2 rounded-full mt-4">
                Post
              </button>
            </div>

            <div className="w-full lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-gray-900 p-4 rounded-lg shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
                      <span className="font-semibold">{post.username}</span>
                    </div>
                  </div>
                  <div className="relative w-full pt-[100%] overflow-hidden rounded-lg">
                    {post.mediaType === "image" ? (
                      <img src={post.mediaUrl} alt="Post" className="absolute top-0 left-0 w-full h-full object-cover" />
                    ) : (
                      <video src={post.mediaUrl} controls className="absolute top-0 left-0 w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="mt-4 h-16 overflow-y-auto custom-scrollbar">
                    <p className="text-sm">{post.about}</p>
                  </div>
                  <div className="mt-4 h-24 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      {post.comments &&
                        post.comments.map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <span className="font-semibold">{comment.email}:</span> {comment.comment}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="mt-4 mb-2 flex">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-1 bg-gray-800 text-white p-2 rounded-l-full focus:outline-none"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddComment(post.id, e.target.value);
                          e.target.value = ""; // Clear the input field
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        handleAddComment(post.id, input.value);
                        input.value = ""; // Clear the input field
                      }}
                      className="bg-green-500 text-black px-3 py-1 rounded-r-full"
                    >
                      Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Community;