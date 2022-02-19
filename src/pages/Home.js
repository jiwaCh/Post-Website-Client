import React from "react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaUser, FaTrashAlt, FaTrash } from "react-icons/fa";

//impoprt use histro etcc....

const Home = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  // const [state, setState] = useState(true);
  const [currentUserId, setCurrentUserId] = useState();
  const [listOfPosts, setListOfPosts] = useState([]);
  const [listOfLikedPosts, setListOfLikedPosts] = useState([]);
  const refImg = useRef([]);
  let navigate = useNavigate();
  const isProduction = true;
  let hostUrl = null;

  // // // getting data from parent -- this is called whenever setIsLoggedIn is changed in APP.JS!!!....
  if (props.passingDataParentToChild_isLogged !== isLoggedIn) {
    console.log("Change in log state from home post " + isLoggedIn);
    setIsLoggedIn(props.passingDataParentToChild_isLogged);
  }

  useEffect(() => {
    if (isProduction) {
      hostUrl = "https://post-website-server.herokuapp.com/";
    } else {
      hostUrl = "http://localhost:3001/";
    }

    // get all posts and likes count

    if (!isLoggedIn) {
      console.log("navigate to login page from home page");
      return navigate("/login");
    }

    axios
      .get(hostUrl + "Posts", {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        console.log(response);
        // if (response.data.state.includes("notLoggedIn")) {
        //   setIsLoggedIn(false);
        //   navigate("/login");
        // } else {
        setIsLoggedIn(true);
        setCurrentUserId(response.data.userId);
        setListOfLikedPosts(response.data.listOfLikedPosts);
        setListOfPosts(response.data.listOfPosts);
        // }

        // if user is not logged in then send to login page...
      });
  }, [isLoggedIn]);

  const onClickLikeButton = (PostId, e) => {
    e.stopPropagation(); // stop propagation stop the event from bubbling up to parent elements or capturing down to child elements.

    // if not logged in, then alert
    if (!currentUserId) {
      return alert("Login to like a post");
    }

    // console.log("onClickLikeButton");
    axios
      .post(
        hostUrl + "likes",
        { PostId: PostId },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      )
      .then((response) => {
        setListOfPosts(
          listOfPosts.map((post) => {
            if (post.id === PostId) {
              if (response.data.liked) {
                // like count = length of array. By adding "randomElement" to array, it increases array's length.
                setListOfLikedPosts([...listOfLikedPosts, PostId]);
                return { ...post, Likes: [...post.Likes, "randomElement"] };
              } else {
                // remove element, hence decrease array length (like count)
                setListOfLikedPosts(
                  listOfLikedPosts.filter((value) => {
                    return value !== PostId;
                  })
                );
                // console.log("false");
                post.Likes.pop();
                return post;
              }
            } else {
              return post;
            }
          })
        );
      });
  };

  const onClickDeletePost = (e, PostId) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete post?")) return;

    axios
      .delete(hostUrl + "Posts", {
        headers: {
          PostId: PostId,
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then(() => {
        setListOfPosts(
          listOfPosts.filter((listOfPosts) => {
            return listOfPosts.id !== PostId;
          })
        );
      });
  };

  const resizeImage_Keep_AspectRatio = (index) => {
    const maxWidth = 100;
    const maxHeight = 100;
    const currentWidth = refImg.current[index].width;
    const currentHeight = refImg.current[index].height;

    let ratio = Math.min(maxWidth / currentWidth, maxHeight / currentHeight);

    refImg.current[index].style.width = currentWidth * ratio + "%";
    refImg.current[index].style.height = currentHeight * ratio + "%";
  };
  return (
    <div className="Homepage">
      {listOfPosts.map((value, index) => {
        return (
          <div key={index} className="post">
            <div className="topContainer">
              <div className="left">
                <FaUser className="iconUser" />
                <span className="UserName"> {value.userName}</span>
              </div>
              {currentUserId === value.UserId ? (
                <div className="right">
                  <FaTrash
                    className="deletePostButton"
                    onClick={(e) => {
                      onClickDeletePost(e, value.id);
                    }}
                  />
                </div>
              ) : null}
            </div>
            <div
              className="title"
              onClick={() => navigate(`/post/${value.id}`)}
            >
              <p>{value.title} </p>
            </div>
            <div className="body" onClick={() => navigate(`/post/${value.id}`)}>
              <p>{value.postText} </p>
            </div>
            {value.imageURL !== null ? (
              <img
                className="homeImage"
                onClick={() => navigate(`/post/${value.id}`)}
                // style={{ display: "none" }} // meant to prevent flash -- does not work as well.. need to understand why it keeps flashing. also notice css change / update on refresh
                ref={(eachImg) => {
                  refImg.current[index] = eachImg;
                }}
                src={value.imageURL}
                onLoad={() => {
                  // console.log("image.onload");
                  // console.log("value.imageURL" + value.imageURL);
                  // console.log(refImg.current[0]);
                  // console.log(refImg.current);

                  resizeImage_Keep_AspectRatio(index);

                  // console.log(
                  //   "width" +
                  //     refImg.current[index].style.width +
                  //     " height" +
                  //     refImg.current[index].style.height
                  // );

                  // refImg.current[index].style.width = 100 + "%";
                  // refImg.current[index].style.height = 100 + "%";
                }}
                alt="a"
              />
            ) : null}

            <div className="footer">
              <div className="footerTextDiv">
                <div className="LikesCount"> {value.Likes.length} Likes</div>
                <div
                  className="CommentCount"
                  onClick={() => navigate(`/post/${value.id}`)}
                >
                  {value.Comments.length} Comments
                </div>
              </div>

              <div className="LikeButton">
                {listOfLikedPosts.includes(value.id) ? (
                  <div>
                    <AiFillHeart
                      className="likeIconButtonFill"
                      style={{ color: "red" }}
                      onClick={(e) => {
                        onClickLikeButton(value.id, e);
                      }}
                    />
                  </div>
                ) : (
                  <AiOutlineHeart
                    className="likeIconButtonOutline"
                    onClick={(e) => {
                      onClickLikeButton(value.id, e);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
