import React from "react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaUser, FaTrashAlt, FaTrash } from "react-icons/fa";

//impoprt use histro etcc....

const Home = (props) => {

  let loadingTextCounter = 0;
  let loadingPercent = 0;
  const [loadingText, setLoadingText] = useState("Establishing connection...");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  let isLoading_LimitFetchData = true; // dont set isLoggedIn usestate in useeffect as it causes refetch of data, use this instead
  const [isLoading, setIsLoading] = useState(true);
  // const [state, setState] = useState(true);
  const [loadPost, setLoadPost] = useState(false);
  const [currentUserId, setCurrentUserId] = useState();
  const [listOfPosts, setListOfPosts] = useState([]);
  const [listOfLikedPosts, setListOfLikedPosts] = useState([]);
  const refImg = useRef([]);
  let navigate = useNavigate();

  // // // getting data from parent -- this is called whenever setIsLoggedIn is changed in APP.JS!!!....
  if (
    props.passingDataParentToChild_isLogged !== isLoggedIn &&
    props.passingDataParentToChild_isLogged !== null
  ) {
    console.log(
      "Change in log state from home post from " +
        isLoggedIn +
        "to " +
        props.passingDataParentToChild_isLogged
    );
    setIsLoggedIn(props.passingDataParentToChild_isLogged);
  }

  let setTimeoutInstance;

  const loadingTextTimer = (timer)=>{
    console.log("New timer instance being created");
    if(isLoading_LimitFetchData){
    // loading
    setTimeoutInstance = setTimeout(() => {
        if(loadingPercent < 90){
        let randomValue =  Math.floor(Math.random(6,10)* 10);
        loadingPercent = loadingPercent + randomValue;
        setLoadingText("Loading " + loadingPercent + "%");
        loadingTextCounter++;
        clearTimeout(setTimeoutInstance);
        loadingTextTimer(1000);
        }
      }, timer);

    }
  } 


  useEffect(() => {

    loadingTextTimer(2000);

    console.log("Home page useeffect called");
    // get all posts and likes count

    if (!isLoggedIn) {
      console.log("navigate to login page from home page");
      return navigate("/login");
    } else {
      const tempToken = localStorage.getItem("accessToken");
      try {
        if (tempToken === null && tempToken.length < 1) {
          navigate("/login");
        }
      } catch (e) {
        console.log("empty token");
        navigate("/login");
      }
    }

    try {
      axios
        .get("https://post-website-server.herokuapp.com/Posts", {
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
          setIsLoading(false);
          isLoading_LimitFetchData = false;
          console.log("set to false : " + isLoading);
          setIsLoggedIn(true);
          setCurrentUserId(response.data.userId);
          setListOfLikedPosts(response.data.listOfLikedPosts);
          setListOfPosts(response.data.listOfPosts);
          // }

          // if user is not logged in then send to login page...
        });
    } catch (e) {
      console.log("Error getting post");
    }
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
        "https://post-website-server.herokuapp.com/likes",
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
      .delete("https://post-website-server.herokuapp.com/Posts", {
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
    console.log("on resize image load called");
    const maxWidth = 100;
    const maxHeight = 100;
    const currentWidth = refImg.current[index].width;
    const currentHeight = refImg.current[index].height;

    let ratio = Math.min(maxWidth / currentWidth, maxHeight / currentHeight);

    refImg.current[index].style.width = currentWidth * ratio + "%";
    refImg.current[index].style.height = currentHeight * ratio + "%";
    refImg.current[index].style.visibility = "visible";
  };
  return (
    <div className="Homepage">
      {isLoading ? <span className="loading">{loadingText}</span> : null}
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
                style={{ visibility: "hidden" }}
                className="homeImage"
                onClick={() => navigate(`/post/${value.id}`)}
                // style={{ display: "none" }} // meant to prevent flash -- does not work as well.. need to understand why it keeps flashing. also notice css change / update on refresh
                ref={(eachImg) => {
                  refImg.current[index] = eachImg;
                }}
                src={value.imageURL}
                onLoad={() => {
                  console.log("on image load called");
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
