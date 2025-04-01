import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery,useMutation} from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const {mutate,isPending:pendingUpdate,isError:isErrorUpdate,error:errorUpdate} = useMutation({
    mutationKey:["events",params.id],
    mutationFn: updateEvent,
    onSuccess: () =>{
      queryClient.invalidateQueries(["events",params.id])
      navigate("../")
    }
  }) 

  function handleSubmit(formData) {
    mutate({id:params.id,event:formData})
  }

  function handleClose() {
    navigate("../");
  }

  let content;
  if (isPending) {
    content = <LoadingIndicator />;
  }
  if (isError) {
    content = (
      <div className="center">
        <ErrorBlock title="Failed to fetch data" message={error.info.message} />
        <Link to="/events" className="button">
          Okay
        </Link>
      </div>
    );
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button" disabled={pendingUpdate}>
          {pendingUpdate ? "Updating..." : "Update"}
        </button>
      </EventForm>
    );
  }

  return (
    <>
      <Modal onClose={handleClose}>
      {content}
      {isErrorUpdate && (
        <ErrorBlock title="Failed to update" message={errorUpdate.info.message}/>
      )}
      </Modal>
    </>
  );
}
