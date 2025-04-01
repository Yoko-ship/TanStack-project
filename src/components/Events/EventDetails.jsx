import { Link, Outlet, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "../Header.jsx";
import { fetchEvent, deleteEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";
export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event" + params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const {
    mutate,
    isPending: pendingDeletion,
    isError: isErrorDeletion,
    error: errorDeletion,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
      console.log("Успешно удален");
    },
  });

  const deleteHandle = () => {
    mutate({ id: params.id });
  };

  return (
    <>
      {isDelete && (
        <Modal onClose={() => setIsDelete(false)}>
          <h2>Are you sure? </h2>
          <div className="form-actions">
            {pendingDeletion && <p>Deleting,Please wait...</p>}
            {!pendingDeletion && (
              <>
                <button
                  onClick={() => setIsDelete(false)}
                  className="button-text"
                >
                  Cancel
                </button>
                <button onClick={deleteHandle} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeletion && (
            <ErrorBlock title="Failed to delete event" message={errorDeletion.info.message}/>
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && (
        <div id="event-details-content" className="center">
          <p>Loading event details</p>
        </div>
      )}
      {isError && (
        <ErrorBlock title="Error occured" message={error.info.message} />
      )}

      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={() => setIsDelete(true)}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img
              src={`http://localhost:3000/${data.image}`}
              alt={data.description}
            />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>{data.date}</time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
