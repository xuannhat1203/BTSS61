import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import swal from "sweetalert";

interface listJob {
  id: number;
  nameJob: string;
  status: string;
}

export default function BT09() {
  const [listJob, setListJob] = useState<listJob[]>([]);
  const [reListJob, setReListJob] = useState<listJob[]>([]);
  const [checkInput, setCheckInput] = useState<boolean>(false);
  const [valueInput, setValueInput] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    const getValue = async () => {
      try {
        const response = await axios.get("http://localhost:8000/jobs");
        setListJob(response.data);
        setReListJob(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getValue();
  }, []);

  useEffect(() => {
    let count: number = 0;
    for (let i = 0; i < listJob.length; i++) {
      if (listJob[i].status === "true") {
        count += 1;
      }
    }
    if (count === listJob.length && listJob.length > 0) {
      swal("Good job!", "Đã hoàn thành tất cả công việc", "success");
    }
  }, [listJob]);

  const handleDelete = (id: number) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this imaginary file!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        axios
          .delete(`http://localhost:8000/jobs/${id}`)
          .then(() => {
            setListJob((prevList) => prevList.filter((item) => item.id !== id));
            setReListJob((prevList) =>
              prevList.filter((item) => item.id !== id)
            );
            swal("Poof! Your imaginary file has been deleted!", {
              icon: "success",
            });
          })
          .catch((err) => {
            console.error("Error deleting job:", err);
            swal(
              "Error",
              "Failed to delete job. Please try again later.",
              "error"
            );
          });
      } else {
        swal("Your imaginary file is safe!");
      }
    });
  };

  const handleJob = (valueInput: string) => {
    setValueInput(valueInput);
    setCheckInput(false);
  };

  const addJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (valueInput === "") {
      setCheckInput(true);
    } else {
      const newJob = {
        nameJob: valueInput,
        status: "false",
      };
      axios
        .post("http://localhost:8000/jobs", newJob)
        .then((res) => {
          setListJob([...listJob, res.data]);
          setReListJob([...listJob, res.data]);
          setValueInput("");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleChecked = async (id: number, isChecked: boolean) => {
    const updatedListJob = listJob.map((job) =>
      job.id === id ? { ...job, status: isChecked ? "true" : "false" } : job
    );
    setListJob(updatedListJob);
    setReListJob(updatedListJob);

    try {
      const jobToUpdate = updatedListJob.find((job) => job.id === id);
      if (jobToUpdate) {
        await axios.put(`http://localhost:8000/jobs/${id}`, jobToUpdate);
      }
    } catch (err) {
      console.error("Error updating job status:", err);
    }
  };

  const handleEdit = (id: number) => {
    const jobToEdit = listJob.find((job) => job.id === id);
    if (jobToEdit) {
      setEditId(id);
      setName(jobToEdit.nameJob);
      setOpenModal(true);
    }
  };

  const handleSubmit = async () => {
    if (editId !== null) {
      try {
        const updatedJob = { nameJob: name };
        await axios.patch(`http://localhost:8000/jobs/${editId}`, updatedJob);
        setListJob((prevList) =>
          prevList.map((job) =>
            job.id === editId ? { ...job, nameJob: name } : job
          )
        );
        setReListJob((prevList) =>
          prevList.map((job) =>
            job.id === editId ? { ...job, nameJob: name } : job
          )
        );
        setOpenModal(false);
        setName("");
        setEditId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAll = () => {
    setListJob(reListJob);
  };

  const handleComplete = () => {
    const complete = reListJob.filter((item) => item.status === "true");
    setListJob(complete);
  };

  const handleUnfinished = () => {
    const unfinished = reListJob.filter((item) => item.status === "false");
    setListJob(unfinished);
  };
  const handleDelete2 = async () => {
    try {
      const completeDelete = listJob.filter((item) => item.status === "true");
      await Promise.all(
        completeDelete.map((item) =>
          axios.delete(`http://localhost:8000/jobs/${item.id}`)
        )
      );
      setListJob(listJob.filter((item) => item.status === "false"));
      swal("Poof! Completed jobs have been deleted!", {
        icon: "success",
      });
    } catch (err) {
      console.error("Error deleting completed jobs:", err);
      swal(
        "Error",
        "Failed to delete some jobs. Please try again later.",
        "error"
      );
    }
  };
  const deleteAll = async () => {
    try {
      await Promise.all(
        listJob.map((item) =>
          axios.delete(`http://localhost:8000/jobs/${item.id}`)
        )
      );
      setListJob([]);
      setReListJob([]);
      swal("Poof! All jobs have been deleted!", {
        icon: "success",
      });
    } catch (err) {
      console.error("Error deleting all jobs:", err);
      swal(
        "Error",
        "Failed to delete all jobs. Please try again later.",
        "error"
      );
    }
  };

  return (
    <>
      <section className="vh-100" style={{ backgroundColor: "#eee" }}>
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-lg-9 col-xl-7">
              <div className="card rounded-3">
                <div className="card-body p-4">
                  <h4 className="text-center my-3 pb-3">To Do App</h4>
                  <form
                    className="row row-cols-lg-auto g-3 justify-content-center align-items-center mb-4 pb-2"
                    onSubmit={addJob}
                  >
                    <div className="col-12">
                      <div data-mdb-input-init="" className="form-outline">
                        <input
                          type="text"
                          id="form1"
                          className="form-control"
                          value={valueInput}
                          onChange={(e) => handleJob(e.target.value)}
                        />
                        {checkInput && (
                          <div style={{ color: "red" }}>
                            Không được để trống tên công việc
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ paddingBottom: "30px" }} className="col-12">
                      <button
                        type="submit"
                        data-mdb-button-init=""
                        data-mdb-ripple-init=""
                        className="btn btn-primary"
                        style={{ marginTop: "30px", width: "100px" }}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                  <div
                    style={{
                      display: "flex",
                      gap: "40px",
                      paddingLeft: "120px",
                    }}
                  >
                    <button
                      style={{
                        width: "100px",
                        height: "40px",
                        borderRadius: "5px",
                      }}
                      onClick={handleAll}
                    >
                      Tất cả
                    </button>
                    <button
                      style={{
                        width: "140px",
                        height: "40px",
                        borderRadius: "5px",
                      }}
                      onClick={handleComplete}
                    >
                      Đã hoàn thành
                    </button>
                    <button
                      style={{
                        width: "140px",
                        height: "40px",
                        borderRadius: "5px",
                      }}
                      onClick={handleUnfinished}
                    >
                      Chưa hoàn thành
                    </button>
                  </div>
                  <div
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                    className="table-wrapper"
                  >
                    <table className="table mb-4">
                      <thead>
                        <tr>
                          <th scope="col">No.</th>
                          <th scope="col">Todo item</th>
                          <th scope="col">Status</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listJob.map((item: listJob, index) => (
                          <tr key={item.id}>
                            <th scope="row">
                              <input
                                type="checkbox"
                                checked={item.status === "true"}
                                onChange={(e) =>
                                  handleChecked(item.id, e.target.checked)
                                }
                              />
                            </th>
                            {item.status === "false" ? (
                              <td>{item.nameJob}</td>
                            ) : (
                              <td>
                                <s>{item.nameJob}</s>
                              </td>
                            )}
                            <td>
                              {item.status === "true"
                                ? "Đã hoàn thành"
                                : "Chưa hoàn thành"}
                            </td>
                            <td style={{ display: "flex", gap: "10px" }}>
                              <button
                                type="button"
                                data-mdb-button-init=""
                                data-mdb-ripple-init=""
                                className="btn btn-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                data-mdb-button-init=""
                                data-mdb-ripple-init=""
                                className="btn btn-primary"
                                style={{ width: "70px" }}
                                onClick={() => handleEdit(item.id)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      marginLeft: "130px",
                    }}
                  >
                    <button
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        backgroundColor: "red",
                        border: "none",
                        color: "white",
                        marginTop: "30px",
                      }}
                      onClick={handleDelete2}
                    >
                      Xóa công việc đã hoàn thành
                    </button>
                    <button
                      style={{
                        height: "40px",
                        borderRadius: "5px",
                        backgroundColor: "red",
                        border: "none",
                        color: "white",
                        marginTop: "30px",
                      }}
                      onClick={deleteAll}
                    >
                      Xóa tất cả công việc
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {openModal && (
        <div
          className="modal show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh sửa công việc</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setOpenModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label htmlFor="jobName" className="form-label">
                  Nhập tên công việc mới
                </label>
                <input
                  id="jobName"
                  name="name"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOpenModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
