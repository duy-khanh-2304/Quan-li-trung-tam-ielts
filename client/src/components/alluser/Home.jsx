import {
  Col,
  DatePicker,
  Popover,
  Row,
  Tabs,
  Space,
  Progress,
  Card,
  Descriptions,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiUrl, LOCAL_STORAGE_TOKEN_NAME } from "../../common/constants";
import { timetable } from "../../common/timetable";
import { authSelector } from "../../features/reducers/authSlice";
import setAuthToken from "../../utils/setAuthToken";
import { Column } from "@ant-design/plots";
import moment from "moment";
import handleStatus from "../../utils/handleStatus";

const { Meta } = Card;

const Home = () => {
  const authState = useSelector(authSelector);
  const [userInfo, setUserInfo] = useState({});
  const [timeslots, setTimeslots] = useState([]);
  const navigate = useNavigate();
  let homeRole;
  const [course, setCourse] = useState([]);
  const [length, setLength] = useState([]);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalReceipt, setTotalReceipt] = useState(0);
  const [total, setTotal] = useState(0);
  const [payments, setPayments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const { RangePicker } = DatePicker;
  const dateEndFormat = "YYYY-MM-DD 23:59:59";
  const [classList, setClassList] = useState([]);
  const [classTeacher, setClassTeacher] = useState([]);

  if (authState.roles.length === 1) {
    homeRole = authState.roles[0];
  } else {
    for (let role of authState.roles) {
      if (role === "student" || role === "teacher") {
        homeRole = role;
      }
    }
    for (let role of authState.roles) {
      if (role === "employee") {
        homeRole = role;
      }
    }
    for (let role of authState.roles) {
      if (role === "admin") {
        homeRole = role;
      }
    }
  }
  const onChange = async (dates, dateStrings) => {
    if (dates) {
      if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
        setAuthToken();
      }
      await axios
        .get(
          `${apiUrl}/api/voucher/${dateStrings[0]}/to/${moment(
            dateStrings[1]
          ).format(dateEndFormat)}`
        )
        .then((res) => {
          return res.data;
        })
        .then((res) => {
          let totalPaymentMoney = 0;
          let totalReceiptMoney = 0;
          const newPayment = [];
          const newReceipt = [];
          res.forEach((item) => {
            let check = false;
            if (item.status === "COMPLETED" && item.type === "PAY") {
              if (newPayment.length === 0) {
                newPayment.push({
                  createdAt: new Date(item.createdAt),
                  amount: item.amount,
                });
              } else {
                newPayment.forEach((itemPayment) => {
                  if (
                    itemPayment.createdAt.toDateString() ===
                    new Date(item.createdAt).toDateString()
                  ) {
                    itemPayment.amount += item.amount;
                    check = true;
                  }
                });
                if (check === false) {
                  newPayment.push({
                    createdAt: new Date(item.createdAt),
                    amount: item.amount,
                  });
                }
              }
            }
            if (item.status === "COMPLETED" && item.type === "REI") {
              if (newReceipt.length === 0) {
                newReceipt.push({
                  createdAt: new Date(item.createdAt),
                  amount: item.amount,
                });
              } else {
                newReceipt.forEach((itemReceipt) => {
                  if (
                    itemReceipt.createdAt.toDateString() ===
                    new Date(item.createdAt).toDateString()
                  ) {
                    itemReceipt.amount += item.amount;
                    check = true;
                  }
                });
                if (check === false) {
                  newReceipt.push({
                    createdAt: new Date(item.createdAt),
                    amount: item.amount,
                  });
                }
              }
            }
          });
          res.forEach((item) => {
            if (item.type === "PAY") {
              if (item.status === "COMPLETED") {
                totalPaymentMoney += item.amount;
              }
            }
            if (item.type === "REI") {
              if (item.status === "COMPLETED") {
                totalReceiptMoney += item.amount;
              }
            }
          });
          setPayments(newPayment);
          setReceipts(newReceipt);

          setTotalPayment((prevState) => totalPaymentMoney);
          setTotalReceipt((prevState) => totalReceiptMoney);
          setTotal((prevState) => totalPaymentMoney - totalReceiptMoney);
        });
    } else {
      loadVoucherList();
    }
  };
  const onChangeEmployee = async (dates, dateStrings) => {
    if (dates) {
      if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
        setAuthToken();
      }
      await axios
        .get(
          `${apiUrl}/api/voucher/payment/employeeId/${authState.id}/${
            dateStrings[0]
          }/to/${moment(dateStrings[1]).format(dateEndFormat)}`
        )
        .then((res) => {
          return res.data;
        })
        .then((res) => {
          const newPayment = [];
          const newLength = [];
          let totalMoney = 0;

          res.forEach((item) => {
            let check = false;
            if (
              item.voucher.status === "COMPLETED" &&
              item.voucher.type === "PAY"
            ) {
              if (newPayment.length === 0) {
                newPayment.push({
                  date: new Date(item.voucher.createdAt),
                  amount: item.voucher.amount,
                });
                newLength.push({
                  date: new Date(item.voucher.createdAt),
                  quantity: 1,
                });
              } else {
                newPayment.forEach((itemPayment) => {
                  if (
                    itemPayment.date.toDateString() ===
                    new Date(item.voucher.createdAt).toDateString()
                  ) {
                    itemPayment.amount += item.voucher.amount;
                    check = true;
                  }
                });
                newLength.forEach((itemPayment) => {
                  if (
                    itemPayment.date.toDateString() ===
                    new Date(item.voucher.createdAt).toDateString()
                  ) {
                    itemPayment.quantity += 1;
                    check = true;
                  }
                });
                if (check === false) {
                  newPayment.push({
                    date: new Date(item.voucher.createdAt),
                    amount: item.voucher.amount,
                  });
                  newLength.push({
                    date: new Date(item.voucher.createdAt),
                    quantity: 1,
                  });
                }
              }
            }
          });
          res.forEach((item) => {
            if (item.voucher.type === "PAY") {
              if (item.voucher.status === "COMPLETED") {
                totalMoney += item.voucher.amount;
              }
            }
          });
          setTotal(totalMoney);
          setPayments(newPayment);
          setLength(newLength);
        });
    } else {
      asyncFetch();
    }
  };

  const loadUser = async () => {
    if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
      setAuthToken();
    }
    try {
      const user = await axios.get(`${apiUrl}/api/user/find/${authState.user}`);
      setUserInfo(user.data);
    } catch (error) {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME);
      delete axios.defaults.headers.common["Authorization"];
    }
  };
  const loadStudentClassList = async () => {
    if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
      setAuthToken();
    }
    await axios
      .get(`${apiUrl}/api/student_class/studentId/${authState.id}`)
      .then((res) => {
        setTimeslots([]);
        setClassList(res.data);
        res.data.forEach((obj) => {
          if (
            obj.classes.status === "STUDYING" ||
            obj.classes.status === "WAITING"
          )
            obj.classes.timeslots.forEach((timeslot) => {
              setTimeslots((old) => [
                ...old,
                {
                  id: timeslot.id,
                  date: timeslot.date,
                  time: timeslot.time,
                  classId: obj.classes.id,
                  classCode: obj.classes.code,
                  className: obj.classes.name,
                  room: obj.classes.room,
                  address: obj.classes.department.address,
                },
              ]);
            });
        });
      });
  };
  const loadVoucherList = async () => {
    if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
      setAuthToken();
    }
    await axios
      .get(`${apiUrl}/api/voucher/`)
      .then((res) => {
        return res.data;
      })
      .then((res) => {
        let totalPaymentMoney = 0;
        let totalReceiptMoney = 0;
        const newPayment = [];
        const newReceipt = [];
        res.forEach((item) => {
          let check = false;
          if (item.status === "COMPLETED" && item.type === "PAY") {
            if (newPayment.length === 0) {
              newPayment.push({
                createdAt: new Date(item.createdAt),
                amount: item.amount,
              });
            } else {
              newPayment.forEach((itemPayment) => {
                if (
                  itemPayment.createdAt.toDateString() ===
                  new Date(item.createdAt).toDateString()
                ) {
                  itemPayment.amount += item.amount;
                  check = true;
                }
              });
              if (check === false) {
                newPayment.push({
                  createdAt: new Date(item.createdAt),
                  amount: item.amount,
                });
              }
            }
          }
          if (item.status === "COMPLETED" && item.type === "REI") {
            if (newReceipt.length === 0) {
              newReceipt.push({
                createdAt: new Date(item.createdAt),
                amount: item.amount,
              });
            } else {
              newReceipt.forEach((itemReceipt) => {
                if (
                  itemReceipt.createdAt.toDateString() ===
                  new Date(item.createdAt).toDateString()
                ) {
                  itemReceipt.amount += item.amount;
                  check = true;
                }
              });
              if (check === false) {
                newReceipt.push({
                  createdAt: new Date(item.createdAt),
                  amount: item.amount,
                });
              }
            }
          }
        });
        res.forEach((item) => {
          if (item.type === "PAY") {
            if (item.status === "COMPLETED") {
              totalPaymentMoney += item.amount;
            }
          }
          if (item.type === "REI") {
            if (item.status === "COMPLETED") {
              totalReceiptMoney += item.amount;
            }
          }
        });
        setPayments(newPayment);
        setReceipts(newReceipt);

        setTotalPayment((prevState) => totalPaymentMoney);
        setTotalReceipt((prevState) => totalReceiptMoney);
        setTotal((prevState) => totalPaymentMoney - totalReceiptMoney);
      });
  };

  const loadTeacherClassList = async () => {
    if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
      setAuthToken();
    }
    await axios
      .get(`${apiUrl}/api/teacherClass/teacherId/${authState.id}`)
      .then((res) => {
        setTimeslots([]);
        setClassTeacher(res.data);
        res.data.forEach((obj) => {
          if (
            obj.classes.status === "STUDYING" ||
            obj.classes.status === "WAITING"
          )
            obj.classes.timeslots.forEach((timeslot) => {
              setTimeslots((old) => [
                ...old,
                {
                  id: timeslot.id,
                  date: timeslot.date,
                  time: timeslot.time,
                  classId: obj.classes.id,
                  classCode: obj.classes.code,
                  className: obj.classes.name,
                  room: obj.classes.room,
                  address: obj.classes.department.address,
                },
              ]);
            });
        });
      });
  };

  const listClassTeacher = classTeacher.map((e) => {
    return (
      <Col span={8} className="classTeacher">
        <Card title={e.classes.name} bordered={false} style={{cursor: 'pointer'}} onClick={() => navigate(`/teacher/class/detail/${e.classes.id}`)}>
          Kh??a h???c: {e.classes.course.name}
          <br />
          Ti???n ?????: {e.classes.progress} / {e.classes.course.numberSession} bu???i
          <br/>
          T??nh tr???ng: {handleStatus(e.status)}
        </Card>
      </Col>
    );
  });

  const loadCourseList = async () => {
    if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
      setAuthToken();
    }
    await axios.get(`${apiUrl}/api/course/`).then((res) => {
      setCourse(res.data);
    });
  };

  const courseRender = course.map((e) => {
    return (
      <Col span={8} className="courseCol">
        <Card
          hoverable
          style={{ width: "100%" }}
          cover={<img alt="example" src={e.image} />}
        >
          <Meta title={e.name} />
        </Card>
      </Col>
    );
  });

  const asyncFetch = async () => {
    if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
      setAuthToken();
    }
    await axios
      .get(`${apiUrl}/api/voucher/payment/employeeId/${authState.id}`)
      .then((res) => {
        return res.data;
      })
      .then((res) => {
        const newPayment = [];
        const newLength = [];

        res.forEach((item) => {
          let check = false;
          if (
            item.voucher.status === "COMPLETED" &&
            item.voucher.type === "PAY"
          ) {
            if (newPayment.length === 0) {
              newPayment.push({
                date: new Date(item.voucher.createdAt),
                amount: item.voucher.amount,
              });
              newLength.push({
                date: new Date(item.voucher.createdAt),
                quantity: 1,
              });
            } else {
              newPayment.forEach((itemPayment) => {
                if (
                  itemPayment.date.toDateString() ===
                  new Date(item.voucher.createdAt).toDateString()
                ) {
                  itemPayment.amount += item.voucher.amount;
                  check = true;
                }
              });
              newLength.forEach((itemPayment) => {
                if (
                  itemPayment.date.toDateString() ===
                  new Date(item.voucher.createdAt).toDateString()
                ) {
                  itemPayment.quantity += 1;
                  check = true;
                }
              });
              if (check === false) {
                newPayment.push({
                  date: new Date(item.voucher.createdAt),
                  amount: item.voucher.amount,
                });
                newLength.push({
                  date: new Date(item.voucher.createdAt),
                  quantity: 1,
                });
              }
            }
          }
        });
        setPayments(newPayment);
        setLength(newLength);
        let totalMoney = 0;
        res.forEach((item) => {
          if (
            item.voucher.status === "COMPLETED" &&
            item.voucher.type === "PAY"
          ) {
            totalMoney += item.voucher.amount;
          }
        });
        setTotal(totalMoney);
      });
  };

  useEffect(() => {
    loadUser();
    if (homeRole === "student") {
      loadStudentClassList();
      loadCourseList();
    }
    if (homeRole === "teacher") loadTeacherClassList();
    if (homeRole === "employee") asyncFetch();
    if (homeRole === "admin") loadVoucherList();
    // eslint-disable-next-line
  }, []);
  const payment = {
    data: payments,
    xField: "createdAt",
    yField: "amount",
    xAxis: {
      type: "timeCat",
      tickCount: 5,
    },
    minColumnWidth: 30,
    maxColumnWidth: 40,
    meta: {
      amount: { alias: "S??? ti???n" },
      // formatter: (value) => value + 'vn??'
    },
  };
  const receipt = {
    data: receipts,
    xField: "createdAt",
    yField: "amount",
    xAxis: {
      type: "timeCat",
      tickCount: 5,
    },
    minColumnWidth: 30,
    maxColumnWidth: 40,
    meta: {
      amount: { alias: "S??? ti???n" },
    },
  };
  const lengths = {
    data: length,
    xField: "date",
    yField: "quantity",
    xAxis: {
      type: "timeCat",
      tickCount: 5,
    },
    minColumnWidth: 30,
    maxColumnWidth: 40,
    pixelRation: 1,
  };
  const config = {
    data: payments,
    xField: "date",
    yField: "amount",
    xAxis: {
      type: "timeCat",
      tickCount: 5,
    },
    minColumnWidth: 30,
    maxColumnWidth: 40,
  };

  return (
    <Row justify="center">
      <Col span={23} offset={0}>
        <Row className="section-title">TRANG CH???</Row>
        <Row className="subsection-title">
          <div>
            <span>TH??NG TIN C?? NH??N</span>
          </div>
        </Row>
        <Row gutter={50}>
          <Col span={17}>
            <Descriptions
              title="Th??ng tin c?? b???n"
              layout="vertical"
              style={{
                backgroundColor: "#fff",
                padding: "16px 32px",
                borderRadius: "5px",
              }}
              contentStyle={{ fontWeight: "600", fontSize: "16px" }}
            >
              <Descriptions.Item label="H??? v?? t??n">
                {userInfo.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="S??? ??i???n tho???i">
                {userInfo.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Tr???ng th??i">
                {handleStatus(userInfo.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ng??y sinh">
                {new Date(userInfo.dob).toLocaleDateString("en-GB")}
              </Descriptions.Item>
              <Descriptions.Item label="?????a ch???" span={2}>
                {userInfo.address}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={7}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                borderRadius: "5px",
                height: "100%",
              }}
            >
              <img
                alt="promo"
                className="banner-1920 banner-image"
                src="https://sapo.sapocdn.net/sapo-frontend-v3/master/static/media/99a844232cb72df77837.jpg"
                width="auto"
                height="auto"
              ></img>
            </div>
          </Col>
        </Row>
        {homeRole === "admin" && (
          <>
            <Row className="subsection-title mt50">
              <div>
                <span>T???NG QUAN T??I CH??NH</span>
              </div>
            </Row>
            <Row
              className="flex-center"
              style={{
                backgroundColor: "#fff",
                borderRadius: "5px",
                marginBottom: "18px",
                padding: "20px",
              }}
            >
              <Col span={4} className="column-money-title">
                <h3>T???ng thu</h3>
                <h4 style={{ color: "var(--green)" }}>
                  {totalPayment.toLocaleString()}
                </h4>
              </Col>
              <Col span={3} className="column-money-price">
                -
              </Col>
              <Col span={4} className="column-money-title">
                <h3>T???ng chi</h3>
                <h4 style={{ color: "var(--red)" }}>
                  {totalReceipt.toLocaleString()}
                </h4>
              </Col>
              <Col span={3} className="column-money-price">
                =
              </Col>
              <Col span={4} className="column-money-title">
                <h3>S??? d??</h3>
                <h4 style={{ color: "var(--main)" }}>
                  {total.toLocaleString()} VN??
                </h4>
              </Col>
            </Row>
            <Row style={{ borderRadius: "5px" }}>
              <Space direction="vertical" size={12}>
                <RangePicker
                  size="large"
                  ranges={{
                    "H??m nay": [moment(), moment()],
                    "H??m qua": [
                      moment().subtract(1, "day"),
                      moment().subtract(1, "day"),
                    ],
                    "Tu???n n??y": [moment().startOf("week"), moment()],
                    "Tu???n tr?????c": [
                      moment().subtract(1, "week").startOf("week"),
                      moment().subtract(1, "week").endOf("week"),
                    ],
                    "Th??ng n??y": [
                      moment().startOf("month"),
                      moment().endOf("month"),
                    ],
                    "Th??ng tr?????c": [
                      moment().subtract(1, "months").startOf("month"),
                      moment().subtract(1, "months").endOf("month"),
                    ],
                  }}
                  onChange={onChange}
                  style={{ borderRadius: "5px" }}
                />
              </Space>
            </Row>
            <Row justify="center" gutter={50}>
              <Col span={12}>
                <Row className="subsection-title mt50">
                  <div>
                    <span>TH???NG K?? DOANH THU</span>
                  </div>
                </Row>
                <Row
                  style={{
                    backgroundColor: "#fff",
                    padding: "16px",
                    margin: "0 0 32px 0",
                    borderRadius: "5px",
                  }}
                >
                  <Tabs
                    defaultActiveKey="1"
                    type="card"
                    style={{ width: "100%" }}
                  >
                    <Tabs.TabPane tab="Doanh thu" key="2">
                      <Column style={{ width: "100%" }} {...payment} />
                    </Tabs.TabPane>
                  </Tabs>
                </Row>
              </Col>
              <Col span={12}>
                <Row className="subsection-title mt50">
                  <div>
                    <span>TH???NG K?? CHI TI??U</span>
                  </div>
                </Row>
                <Row
                  style={{
                    backgroundColor: "#fff",
                    padding: "16px",
                    margin: "0 0 32px 0",
                    borderRadius: "5px",
                  }}
                >
                  <Tabs
                    defaultActiveKey="1"
                    type="card"
                    style={{ width: "100%" }}
                  >
                    <Tabs.TabPane tab="Chi ti??u" key="2">
                      <Column style={{ width: "100%" }} {...receipt} />
                    </Tabs.TabPane>
                  </Tabs>
                </Row>
              </Col>
            </Row>
            
          </>
        )}
        {homeRole === "employee" && (
          <>
            <Row className="subsection-title mt50">
              <div>
                <span>TH???NG K?? DOANH THU</span>
              </div>
            </Row>
            <Row style={{ backgroundColor: "#fff", padding: "16px" }}>
              <Space direction="vertical" size={12}>
                <RangePicker
                  size="large"
                  ranges={{
                    "H??m nay": [moment(), moment()],
                    "H??m qua": [
                      moment().subtract(1, "day"),
                      moment().subtract(1, "day"),
                    ],
                    "Tu???n n??y": [moment().startOf("week"), moment()],
                    "Tu???n tr?????c": [
                      moment().subtract(1, "week").startOf("week"),
                      moment().subtract(1, "week").endOf("week"),
                    ],
                    "Th??ng n??y": [
                      moment().startOf("month"),
                      moment().endOf("month"),
                    ],
                    "Th??ng tr?????c": [
                      moment().subtract(1, "months").startOf("month"),
                      moment().subtract(1, "months").endOf("month"),
                    ],
                  }}
                  onChange={onChangeEmployee}
                  style={{ borderRadius: "5px" }}
                />
              </Space>
            </Row>

            <Row style={{ backgroundColor: "#fff", padding: "16px" }}>
              <Tabs defaultActiveKey="1" style={{ width: "100%" }} type="card">
                <Tabs.TabPane tab="T???ng s??? ti???n ???? thu" key="2">
                  <div style={{display: "flex", gap: "10px", alignItems: "center"}}>T???ng s??? ti???n ???? thu:
                  <h3>{total.toLocaleString()} VN??</h3> </div>
                  
                </Tabs.TabPane>
              </Tabs>
            </Row>
            <Row
              style={{
                backgroundColor: "#fff",
                padding: "16px",
                margin: "16px 0 16px 0",
              }}
            >
              <Tabs defaultActiveKey="1" type="card" style={{ width: "100%" }}>
                <Tabs.TabPane tab="Doanh thu" key="2">
                  <Column style={{ width: "100%" }} {...config} />
                </Tabs.TabPane>
              </Tabs>
            </Row>
            <Row className="subsection-title mt50">
              <div>
                <span>TH???NG K?? KH??CH H??NG</span>
              </div>
            </Row>
            <Row
              style={{
                backgroundColor: "#fff",
                padding: "16px",
                margin: "16px 0 16px 0",
              }}
            >
              <Tabs defaultActiveKey="1" type="card" style={{ width: "100%" }}>
                <Tabs.TabPane tab="S??? l?????ng phi???u ho??n th??nh" key="2">
                  <Column style={{ width: "100%" }} {...lengths} />
                </Tabs.TabPane>
              </Tabs>
            </Row>
          </>
        )}
        {homeRole === "student" && (
          <>
            <Row className="subsection-title mt50">
              <div>
                <span>TH???I KH??A BI???U</span>
              </div>
            </Row>
            <Row justify="space-around" className="timetable mt25">
              {timetable.map((thisday) => (
                <div className="timetable-weekday" style={thisday.weekDayStyle}>
                  <div className="timetable-weekday-title">
                    <div>{thisday.weekDayString}</div>
                    <div>{thisday.date}</div>
                  </div>
                  {timeslots
                    .sort((a, b) => a.id - b.id)
                    .map((timeslot) =>
                      timeslot.id < thisday.weekDay * 5 + 1 &&
                      timeslot.id > thisday.weekDay * 5 - 5 ? (
                        <Popover
                          title="Th??ng tin l???p"
                          key={timeslot.id}
                          content={
                            <div>
                              <p>M?? l???p: {timeslot.classCode}</p>
                              <p>T??n l???p: {timeslot.className}</p>
                              <p>
                                Th???i gian: {timeslot.time} - {timeslot.date}
                              </p>
                              <p>Ph??ng h???c: {timeslot.room}</p>
                              <p>?????a ch???: {timeslot.address}</p>
                            </div>
                          }
                        >
                          <div
                            className="timetable-session"
                            onClick={(e) =>
                              navigate(
                                `/student/class/detail/${timeslot.classId}`
                              )
                            }
                          >
                            <div>{timeslot.classCode}</div>
                            <div>{timeslot.time}</div>
                          </div>
                        </Popover>
                      ) : (
                        <> </>
                      )
                    )}
                </div>
              ))}
            </Row>

            <Row className="subsection-title mt50">
              <div>
                <span>TI???N ????? H???C</span>
              </div>
            </Row>
            <Row
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                margin: "16px 0 16px 0",
                borderRadius: "5px",
              }}
            >
              <Col span={24}>
                {classList.map((item, index) => {
                  return (
                    <Row
                      style={{
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                        marginBottom: "30px",
                      }}
                    >
                      <Col span={9}>
                        <h3>
                          {item.classes.name} {" - "} {item.classes.code}
                        </h3>
                      </Col>
                      <Col span={9}>
                        <Progress
                          type="circle"
                          strokeColor={{
                            "0%": "#108ee9",
                            "100%": "#87d068",
                          }}
                          strokeWidth={6}
                          width={80}
                          percent={Math.round(
                            (item.classes.progress /
                              item.classes.course.numberSession) *
                              100
                          )}
                        />
                      </Col>
                    </Row>
                  );
                })}
              </Col>
            </Row>

            <Row className="subsection-title mt50">
              <div>
                <span>KH??A H???C</span>
              </div>
            </Row>
            <Row gutter={[50,25]}>{courseRender}</Row>
          </>
        )}
        {homeRole === "teacher" && (
          <>
            <Row className="subsection-title mt50">
              <div>
                <span>L???CH D???Y S???P T???I</span>
              </div>
            </Row>
            <Row justify="space-around" className="timetable mt25">
              {timetable.map((thisday) => (
                <div className="timetable-weekday" style={thisday.weekDayStyle}>
                  <div className="timetable-weekday-title">
                    <div>{thisday.weekDayString}</div>
                    <div>{thisday.date}</div>
                  </div>
                  {timeslots
                    .sort((a, b) => a.id - b.id)
                    .map((timeslot) =>
                      timeslot.id < thisday.weekDay * 5 + 1 &&
                      timeslot.id > thisday.weekDay * 5 - 5 ? (
                        <Popover
                          title="Th??ng tin l???p"
                          key={timeslot.id}
                          content={
                            <div>
                              <p>M?? l???p: {timeslot.classCode}</p>
                              <p>T??n l???p: {timeslot.className}</p>
                              <p>
                                Th???i gian: {timeslot.time} - {timeslot.date}
                              </p>
                              <p>Ph??ng h???c: {timeslot.room}</p>
                              <p>?????a ch???: {timeslot.address}</p>
                            </div>
                          }
                        >
                          <div
                            className="timetable-session"
                            onClick={(e) =>
                              navigate(
                                `/teacher/class/detail/${timeslot.classId}`
                              )
                            }
                          >
                            <div>{timeslot.classCode}</div>
                            <div>{timeslot.time}</div>
                          </div>
                        </Popover>
                      ) : (
                        <> </>
                      )
                    )}
                </div>
              ))}
            </Row>
            <Row className="subsection-title mt50">
              <div>
                <span>L???P GI???NG D???Y</span>
              </div>
            </Row>
            <Row gutter={[50, 10]}>{listClassTeacher}</Row>
          </>
        )}
      </Col>
    </Row>
  );
};

export default Home;
