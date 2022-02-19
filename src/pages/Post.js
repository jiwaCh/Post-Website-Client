import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaUser, FaTrashAlt, FaTrash } from "react-icons/fa";

const Post = (props) => {
  // const refClearTextField = useRef(null);
  const commentButtonRef = useRef();
  // const refMaxCharacterPrompt = useRef();
  const [isMaxCharacter, setIsMaxCharacter] = useState(false);
  const refImg = useRef();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  let { id } = useParams();
  const [postObject, setPostObject] = useState({});
  const [comments, setComment] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState();
  const isProduction = true;
  let hostUrl = null;

  if (props.passingDataParentToChild_isLogged3 !== isLoggedIn) {
    console.log("Change in log state from each post " + isLoggedIn);
    setIsLoggedIn(props.passingDataParentToChild_isLogged3);
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return navigate("/login");
    }

    if (isProduction) {
      hostUrl = "https://post-website-server.herokuapp.com/";
    } else {
      hostUrl = "http://localhost:3001/";
    }

    commentButtonRef.current.disabled = true;
    // get post
    axios.get(hostUrl + `Posts/byId/${id}`).then((response) => {
      // console.log("the response is " + JSON.stringify(response.data));
      setPostObject(response.data);
    });

    // get comment
    axios.get(hostUrl + `comments/${id}`).then((response) => {
      // console.log("the response is " + JSON.stringify(response.data));
      setComment(response.data);
    });

    // get user
    axios
      .get(hostUrl + `auth/valid`, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        setCurrentUser(response.data.userName);
      });
  }, [isLoggedIn]); // this dependency will prevent an infinite loop

  const addComment = () => {
    console.log("bout to add with id " + id);
    axios
      .post(
        hostUrl + "comments",
        {
          commentBody: newComment,
          PostId: id,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      )
      .then((response) => {
        if (response.data.error) {
          alert("Login to comment on a post");
          console.log(response.data.error);
        } else {
          // here we render the new comment to the list

          // get new sets of comment
          axios.get(hostUrl + `comments/${id}`).then((result) => {
            setComment(result.data);
          });

          // remove text from the input field
          commentButtonRef.current.disabled = true;
          setNewComment("");
        }
      });
  };

  const onDelete = (commentId) => {
    console.log("called on delete");
    axios
      .delete(hostUrl + `comments/${commentId}`, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        console.log(response);
        setComment(
          comments.filter((eachComment) => {
            return eachComment.id !== commentId;
          })
        );
      });
  };

  const resizeImage_Keep_AspectRatio = () => {
    const maxWidth = 100;
    const maxHeight = 100;
    const currentWidth = refImg.current.width;
    const currentHeight = refImg.current.height;

    let ratio = Math.min(maxWidth / currentWidth, maxHeight / currentHeight);

    refImg.current.style.width = currentWidth * ratio + "%";
    refImg.current.style.height = currentHeight * ratio + "%";
  };

  return (
    <div className="postPage">
      <div className="postContainer">
        <div className="post">
          <div className="topContainer">
            <div className="left">
              <FaUser className="iconUser" />
              <span className="UserName"> {postObject.userName}</span>
            </div>
          </div>

          <div className="title">
            <p>{postObject.title} </p>
          </div>
          <div className="body">
            <p>{postObject.postText} </p>
          </div>

          {postObject.imageURL !== null ? (
            <img
              className="homeImage"
              // style={{ display: "none" }} // meant to prevent flash -- does not work as well.. need to understand why it keeps flashing. also notice css change / update on refresh
              ref={refImg}
              src={postObject.imageURL}
              onLoad={() => {
                resizeImage_Keep_AspectRatio();
              }}
              alt="a"
            />
          ) : null}
        </div>
      </div>
      <div className="commentsContainer">
        {isMaxCharacter ? (
          <div className="maxCharacterPrompt">
            Comment too long. Max 2200 characters
          </div>
        ) : (
          <div className="maxCharacterPrompt"></div>
        )}
        <div className="addCommentContainer">
          <textarea
            rows="5"
            className="inputComment"
            type="textarea"
            placeholder="Add a public comment..."
            value={newComment}
            onChange={(event) => {
              console.log(
                "event.target.value.length " + event.target.value.length
              );

              // set button as not clickable if no text is inputted
              if (
                event.target.value.length > 0 ||
                event.target.value.length > 2200
              ) {
                commentButtonRef.current.disabled = false;

                // set max character promt
                if (event.target.value.length > 2200) {
                  setIsMaxCharacter(true);
                } else {
                  setIsMaxCharacter(false);
                }
              } else {
                commentButtonRef.current.disabled = true;
                setIsMaxCharacter(false);
              }

              setNewComment(event.target.value);
            }}
          />
          <button
            className="commentButton"
            ref={commentButtonRef}
            onClick={addComment}
          >
            Comment
          </button>
        </div>
        <div className="listOfComments">
          {comments.map((comment, key) => {
            return (
              <div key={key} className="comment">
                <div className="commentByContainer">
                  <div>
                    <FaUser className="iconUser" />
                    <span> {comment.userName}</span>
                  </div>
                  <div>
                    {currentUser === comment.userName ? (
                      <FaTrash
                        className="deleteCommentButton"
                        onClick={() => onDelete(comment.id)}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="commentBody">{comment.commentBody}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Post;
