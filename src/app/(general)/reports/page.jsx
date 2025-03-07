"use client";

import BarCharts from "@/_components/charts/BarCharts";
import PieCharts from "@/_components/charts/PieCharts";
import Header from "@/_components/header/Header";
import Navigator from "@/_components/navigator/navigator";
import {
  Button,
  Center,
  Loader,
  Modal,
  NativeSelect,
  Switch,
  Table,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
  Document,
  PDFDownloadLink,
  PDFViewer,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import barChart from "./barChart.js";
import ExportToExcel from "./exportToExcel";
import filter from "./filter.js";
import styles from "./reports.module.scss";
import TableRows from "./tableRows";

import Unauthenticated from "@/_components/authentication/unauthenticated";
import { useSession } from "next-auth/react";

// import { DownloadTableExcel } from 'react-export-table-to-excel';

const findUser = (user_type, req_id, users) => {
  if (user_type === "Student") {
    return users.students.find((r) => r.request_id === req_id).name;
  } else if (user_type === "Faculty") {
    return users.faculty.find((r) => r.request_id === req_id).name;
  } else if (user_type === "Staff") {
    return users.staff.find((r) => r.request_id === req_id).name;
  }
};

// // Register font
// Font.register({ family: 'Plus Jakarta Sans', src: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" });
// Font.register({ family: 'Plus Jakarta Sans', src: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap", fontStyle: 'normal', fontWeight: 'normal'});

// Create styles
const stylesPDF = StyleSheet.create({
  page: {
    flexDirection: "column",
    fontSize: 12,
    padding: "40 0 40 0",
  },

  header: {
    padding: "7 0 7 0",
    textAlign: "center",
    alignItems: "center",
  },

  title: {
    padding: "7 0 7 0",
    textAlign: "center",
    alignItems: "center",
  },

  admin_info: {
    padding: "7 0 7 60",
  },

  user_demographics: {
    padding: "7 0 7 0",
  },

  usage_statistics: {
    padding: "7 0 7 0",
  },

  tableContainer: {
    alignItems: "center",
    gap: 10,
  },

  table: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: -1,
    width: "80%",
  },

  pageNumber: {
    position: "absolute",
    fontSize: 12,
    top: 760,
    bottom: 0,
    left: 425,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

const Reports = ({ hideHeader }) => {
  const current = usePathname();
  const [value, setValue] = useState();
  const [value2, setValue2] = useState();

  const [borrows, setBorrows] = useState([]);
  const [bookR, setBookR] = useState([]);
  const [gameR, setGameR] = useState([]);
  const [bookRCounts, setBookRCounts] = useState([]);
  const [gameRCounts, setGameRCounts] = useState([]);
  const [users, setUsers] = useState({});
  const [inval, setInval] = useState();

  const [bookUserTypeC, setBookUserTypeC] = useState([]);
  const [gameUserTypeC, setGameUserTypeC] = useState([]);

  const [studentReqs, setStudentReqs] = useState([]);
  const [studentBookReqs, setStudentBookReqs] = useState([]);
  const [studentGameReqs, setStudentGameReqs] = useState([]);

  const [bookYearLevelC, setBookYearLevelC] = useState([]);
  const [gameYearLevelC, setGameYearLevelC] = useState([]);

  const [bookDeptC, SetBookDeptC] = useState([]);
  const [gameDeptC, SetGameDeptC] = useState([]);

  const [bookReqCount, SetBookReqCount] = useState([]);
  const [gameReqCount, SetGameReqCount] = useState([]);

  const [opened, { open, close }] = useDisclosure(false);

  const [bookSummary, SetBookSummary] = useState(true);
  const [gameSummary, SetGameSummary] = useState(true);
  const [usagePerYearLevel, setUsagePerYearLevel] = useState(true);
  const [usagePerDepartment, SetUsagePerDepartment] = useState(true);
  const [usagePerUserType, setUsagePerUserType] = useState(true);
  const [totalCount, setTotalCount] = useState(true);

  const [validDateRange, SetValidDateRange] = useState(false);

  const [bookUserTypePie, setBookUserTypePie] = useState([]);
  const [bookYearLevelPie, setBookYearLevelPie] = useState([]);
  const [bookDepartmentPie, setBookDepartmentPie] = useState([]);

  const [gameUserTypePie, setGameUserTypePie] = useState([]);
  const [gameYearLevelPie, setGameYearLevelPie] = useState([]);
  const [gameDepartmentPie, setGameDepartmentPie] = useState([]);

  const [selectedBookPieChart, setSelectedBookPieChart] = useState("User Type");
  const [selectedGamePieChart, setSelectedGamePieChart] = useState("User Type");

  const [bookPieChartData, setBookPieChartData] = useState([]);
  const [gamePieChartData, setGamePieChartData] = useState([]);

  const [bookPieChartCount, setBookPieChartCount] = useState(0);
  const [gamePieChartCount, setGamePieChartCount] = useState(0);

  const [barChartData, setBarChartData] = useState([]);

  const [reqSummaryView, setReqSummaryView] = useState("Graph View");
  const [summaryFilter, setSummaryFilter] = useState("None");
  const [ogData, setOgData] = useState([]);

  // const tableRef = useRef(null);

  const handleRequestSummaryView = (event) => {
    const selectedValue = event.target.value;
    setReqSummaryView(selectedValue);
    console.log(selectedValue);
  };

  const handleSummaryFilter = (event) => {
    let newdata = filter(event.target.value, ogData);
    setSummaryFilter(event.target.value);
    setBorrows(newdata);
    setBarChartData(barChart(newdata));
  };

  const [usageStatisticsView, setUsageStatisticsView] = useState("Books");

  const handleUsageStatisticsView = (event) => {
    const selectedValue = event.target.value;
    setUsageStatisticsView(selectedValue);
    console.log(selectedValue);
  };

  const handleBookPieChart = (event) => {
    const selectedValue = event.target.value;
    setSelectedBookPieChart(selectedValue);
    if (selectedValue === "User Type") {
      setBookPieChartData(bookUserTypePie);
      setBookPieChartCount(bookReqCount);
    } else if (selectedValue === "Year Level") {
      setBookPieChartData(bookYearLevelPie);
      setBookPieChartCount(studentBookReqs);
    } else if (selectedValue === "Department") {
      setBookPieChartData(bookDepartmentPie);
      setBookPieChartCount(studentBookReqs);
    }
  };

  const handleGamePieChart = (event) => {
    const selectedValue = event.target.value;
    setSelectedGamePieChart(selectedValue);
    if (selectedValue === "User Type") {
      setGamePieChartData(gameUserTypePie);
      setGamePieChartCount(gameReqCount);
    } else if (selectedValue === "Year Level") {
      setGamePieChartData(gameYearLevelPie);
      setGamePieChartCount(studentGameReqs);
    } else if (selectedValue === "Department") {
      setGamePieChartData(gameDepartmentPie);
      setGamePieChartCount(studentGameReqs);
    }
  };

  const handleBookSummary = () => {
    SetBookSummary(!bookSummary);
  };

  const handleGameSummary = () => {
    SetGameSummary(!gameSummary);
  };

  const handleUsagePerYearLevel = () => {
    setUsagePerYearLevel(!usagePerYearLevel);
  };

  const handleUsagePerDepartment = () => {
    SetUsagePerDepartment(!usagePerDepartment);
  };

  const handleUsagePerUserType = () => {
    setUsagePerUserType(!usagePerUserType);
  };

  const handleTotalCount = () => {
    setTotalCount(!totalCount);
  };

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          value,
          value2,
        }),
      });

      const {
        invalid_dates,
        result,
        bookReqs,
        gameReqs,
        book_requests_count,
        game_requests_count,
        users,
        bookUserTypeC,
        gameUserTypeC,
        studentReqs,
        bookYearLevelC,
        gameYearLevelC,
        bookDeptC,
        gameDeptC,
        bookPie1,
        bookPie2,
        bookPie3,
        gamePie1,
        gamePie2,
        gamePie3,
        barData,
      } = await response.json();

      if (value != null && value2 != null) {
        if (value > value2) {
          SetValidDateRange(false);
        } else SetValidDateRange(true);
      }

      console.log(bookUserTypeC);
      console.log(bookYearLevelC);
      console.log(bookDeptC);
      console.log(barData);

      setBookUserTypePie(bookPie1);
      setBookYearLevelPie(bookPie2);
      setBookDepartmentPie(bookPie3);

      setGameUserTypePie(gamePie1);
      setGameYearLevelPie(gamePie2);
      setGameDepartmentPie(gamePie3);

      setBookUserTypeC(bookUserTypeC);
      setGameUserTypeC(gameUserTypeC);

      setStudentReqs(studentReqs);

      const getTotalCount = (type) => {
        const r = studentReqs.filter((obj) => obj.type === type);
        return Object.keys(r).length;
      };

      setStudentBookReqs(getTotalCount("Book"));
      setStudentGameReqs(getTotalCount("Boardgame"));

      setBookYearLevelC(bookYearLevelC);
      setGameYearLevelC(gameYearLevelC);

      SetBookDeptC(bookDeptC);
      SetGameDeptC(gameDeptC);

      setBorrows(result);
      setOgData(result);

      setBookR(bookReqs);
      setGameR(gameReqs);

      SetBookReqCount(Object.keys(bookReqs).length);
      SetGameReqCount(Object.keys(gameReqs).length);

      setBookRCounts(book_requests_count);
      setGameRCounts(game_requests_count);

      setUsers(users);

      if (selectedBookPieChart === "User Type") {
        setBookPieChartData(bookPie1);
        setBookPieChartCount(Object.keys(bookReqs).length);
      } else if (selectedBookPieChart === "Year Level") {
        setBookPieChartData(bookPie2);
        setBookPieChartCount(getTotalCount("Book"));
      } else if (selectedBookPieChart === "Department") {
        setBookPieChartData(bookPie3);
        setBookPieChartCount(getTotalCount("Book"));
      }

      if (selectedGamePieChart === "User Type") {
        setGamePieChartData(gamePie1);
        setGamePieChartCount(Object.keys(gameReqs).length);
      } else if (selectedBookPieChart === "Year Level") {
        setGamePieChartData(gamePie2);
        setGamePieChartCount(getTotalCount("Boardgame"));
      } else if (selectedBookPieChart === "Department") {
        setGamePieChartData(gamePie3);
        setGamePieChartCount(getTotalCount("Boardgame"));
      }

      setBarChartData(barData);

      if (invalid_dates != undefined && inval != undefined) {
        toast.warning("Invalid date range", { position: "top-center" });
        toast.warning("Fetching records starting from 4 weeks ago", {
          position: "top-center",
        });
      } else {
        setInval(invalid_dates);
      }
    };

    if (value != null && value2 != null) {
      getData();
    }
  }, [value, value2]);

  const { data: session, status } = useSession();

  console.log(session);

  if (status === "loading") {
    return (
      <Loader
        color="yellow"
        size="xl"
        cl
        classNames={{ root: styles.loading }}
      />
    );
  }

  if (status === "unauthenticated") {
    return <Unauthenticated />;
  }

  const bookUsage = {
    type: "bookUsage",
    display: bookSummary,
    bookRCounts: bookRCounts,
    bookR: bookR,
  };

  const gameUsage = {
    type: "gameUsage",
    display: gameSummary,
    gameRCounts: gameRCounts,
    gameR: gameR,
  };

  const bookUserType = {
    type: "bookUserType",
    display: bookSummary && usagePerUserType,
    bookReqCount: bookReqCount,
    bookUserTypeC: bookUserTypeC,
  };

  const gameUserType = {
    type: "gameUserType",
    display: gameSummary && usagePerUserType,
    gameReqCount: gameReqCount,
    gameUserTypeC: gameUserTypeC,
  };

  const bookYearLevel = {
    type: "bookYearLevel",
    display: bookSummary && usagePerYearLevel,
    studentBookReqs: studentBookReqs,
    bookYearLevelC: bookYearLevelC,
  };

  const gameYearLevel = {
    type: "gameYearLevel",
    display: gameSummary && usagePerYearLevel,
    studentGameReqs: studentGameReqs,
    gameYearLevelC: gameYearLevelC,
  };

  const bookDept = {
    type: "bookDept",
    display: bookSummary && usagePerDepartment,
    studentBookReqs: studentBookReqs,
    bookDeptC: bookDeptC,
  };

  const gameDept = {
    type: "gameDept",
    display: gameSummary && usagePerDepartment,
    studentGameReqs: studentGameReqs,
    gameDeptC: gameDeptC,
  };

  const reportPeriodString = `${new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  })} - ${new Date(value2).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  })}`;

  const reportDate = `${new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  })}`;

  // Create Document Component
  const MyDocument = () => (
    <Document>
      <Page size="LETTER" style={stylesPDF.page}>
        <View fixed style={stylesPDF.header}>
          {/* <Image 
          src={"https://upload.wikimedia.org/wikipedia/en/thumb/2/24/Seal_of_the_University_of_Santo_Tomas.svg/1200px-Seal_of_the_University_of_Santo_Tomas.svg.png"} 
          style={{ width: 50, height: 50, }} 
          /> */}
          <Text>University of Santo Tomas</Text>
          <Text>College of Information and Computing Sciences</Text>
        </View>
        <View fixed style={stylesPDF.title}>
          <Text>BiblioTechAI Report Summary</Text>
        </View>
        <View fixed style={stylesPDF.admin_info}>
          <Text>Generated by: {session.user.email}</Text>
          <Text>Report Period: {reportPeriodString}</Text>
          <Text>Report Creation Date: {reportDate}</Text>
        </View>

        {bookSummary &&
          (usagePerYearLevel || usagePerDepartment || usagePerUserType) && (
            <View style={stylesPDF.user_demographics}>
              <Text style={{ paddingLeft: 60 }}>
                User Demographics (Books):
              </Text>
              <View style={stylesPDF.tableContainer}>
                <View style={stylesPDF.table}>
                  <TableRows data={bookUserType} />
                </View>
                <View style={stylesPDF.table}>
                  <TableRows data={bookYearLevel} />
                </View>
                <View style={stylesPDF.table}>
                  <TableRows data={bookDept} />
                </View>
              </View>
            </View>
          )}

        {bookSummary && totalCount && (
          <View style={stylesPDF.usage_statistics}>
            <Text style={{ paddingLeft: 60 }}>Usage Statistics (Books):</Text>
            <View style={stylesPDF.tableContainer}>
              <View style={stylesPDF.table}>
                <TableRows data={bookUsage} />
              </View>
            </View>
          </View>
        )}

        {gameSummary &&
          (usagePerYearLevel || usagePerDepartment || usagePerUserType) && (
            <View style={stylesPDF.user_demographics}>
              <Text style={{ paddingLeft: 60 }}>
                User Demographics (Boardgames):
              </Text>
              <View style={stylesPDF.tableContainer}>
                <View style={stylesPDF.table}>
                  <TableRows data={gameUserType} />
                </View>
                <View style={stylesPDF.table}>
                  <TableRows data={gameYearLevel} />
                </View>
                <View style={stylesPDF.table}>
                  <TableRows data={gameDept} />
                </View>
              </View>
            </View>
          )}

        {gameSummary && totalCount && (
          <View style={stylesPDF.usage_statistics}>
            <Text style={{ paddingLeft: 60 }}>
              Usage Statistics (Boardgames):
            </Text>

            <View style={stylesPDF.tableContainer}>
              <View style={stylesPDF.table}>
                <TableRows data={gameUsage} />
              </View>
            </View>
          </View>
        )}

        <Text
          style={stylesPDF.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = year + month + day;

  const buttonStyle = validDateRange ? styles.activeBtn : styles.inactiveBtn;

  return (
    <>
      <div>
        {!hideHeader && (
          <div>
            <Header currentRoute={current} />
          </div>
        )}
      </div>
      <Center maw="100%" mih="85%" className={styles.center}>
        <div className={styles.left_container}>
          <div className={styles.navigator}>
            {!hideHeader && (
              <Navigator
                buttonText={"Analytics Overview"}
                showIcon={false}
                disableLink={true}
              />
            )}
          </div>
          <div className={styles.date_selector}>
            <h3>Date Range:</h3>
            <DatePickerInput
              placeholder="Pick dates"
              value={value}
              onChange={setValue}
              radius={"xl"} // BEGIN: Set default date to current date
            />
            <DatePickerInput
              placeholder="Pick dates"
              value={value2}
              onChange={setValue2}
              radius={"xl"} // END: Set default date to current date
            />
            <Button
              variant="filled"
              color="#e8b031"
              radius="xl"
              onClick={open}
              disabled={!validDateRange}
            >
              Generate Report
            </Button>
          </div>

          <Modal
            opened={opened}
            onClose={close}
            withCloseButton={false}
            centered
            // size="30%"
            size="70%"
            closeOnClickOutside={false}
          >
            <div className={styles.report_customization}>
              <div className={styles.modal_container}>
                <div className={styles.customization_container}>
                  <h4>Generate Report:</h4>
                  <Switch
                    defaultChecked={bookSummary}
                    label="Books Summary"
                    onChange={handleBookSummary}
                  />
                  <Switch
                    defaultChecked={gameSummary}
                    label="Board Games Summary"
                    onChange={handleGameSummary}
                  />
                  <h4>Show Usage per:</h4>
                  <Switch
                    defaultChecked={usagePerUserType}
                    label="User Type"
                    onChange={handleUsagePerUserType}
                  />
                  <Switch
                    defaultChecked={usagePerYearLevel}
                    label="Year Level"
                    onChange={handleUsagePerYearLevel}
                  />
                  <Switch
                    defaultChecked={usagePerDepartment}
                    label="Department"
                    onChange={handleUsagePerDepartment}
                  />
                  <Switch
                    defaultChecked={totalCount}
                    label="Total Count"
                    onChange={handleTotalCount}
                  />
                </div>

                <div className={styles.preview_container}>
                  <h1>Preview:</h1>
                  <PDFViewer width="600" height="500" showToolbar="false">
                    <MyDocument />
                  </PDFViewer>
                </div>
              </div>

              <div className={styles.btn_container}>
                <PDFDownloadLink
                  document={MyDocument()}
                  fileName={"reports" + formattedDate + ".pdf"}
                >
                  <Button
                    variant="filled"
                    color="#e8b031"
                    radius="xl"
                    disabled={!bookSummary && !gameSummary}
                    className={
                      (bookSummary || gameSummary) &&
                      (usagePerUserType ||
                        usagePerDepartment ||
                        usagePerYearLevel ||
                        totalCount)
                        ? styles.activeDownloadBtn
                        : styles.inactiveDownloadBtn
                    }
                  >
                    Download PDF
                  </Button>
                </PDFDownloadLink>

                <ExportToExcel
                  fileName={"reports" + formattedDate}
                  adminName={session.user.email}
                  reportPeriodString={reportPeriodString}
                  reportDate={reportDate}
                  bookUserType={bookUserType}
                  bookYearLevel={bookYearLevel}
                  bookDept={bookDept}
                  bookUsage={bookUsage}
                  gameUserType={gameUserType}
                  gameYearLevel={gameYearLevel}
                  gameDept={gameDept}
                  gameUsage={gameUsage}
                  bookSummary={bookSummary}
                  gameSummary={gameSummary}
                  usagePerYearLevel={usagePerYearLevel}
                  usagePerDepartment={usagePerDepartment}
                  usagePerUserType={usagePerUserType}
                  totalCount={totalCount}
                />

                <Button
                  variant="outline"
                  color="gray"
                  radius="xl"
                  className={styles.cancelBtn}
                  onClick={close}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>

          <div className={styles.summary_container}>
            <div className={styles.summary_header}>
              <h3>Request Summary</h3>
              <NativeSelect
                radius="xl"
                data={["Graph View", "List View"]}
                onChange={handleRequestSummaryView}
                value={reqSummaryView}
              />
            </div>
            <div className={styles.summary_header}>
              <h3>Filter</h3>
              <NativeSelect
                radius="xl"
                data={[
                  "None",
                  "Faculty",
                  "Staff",
                  "Student",
                  "Book",
                  "Boardgame",
                ]}
                onChange={handleSummaryFilter}
                value={summaryFilter}
              />
            </div>

            {reqSummaryView === "Graph View" && (
              <div
                style={{
                  width: "100%",
                  overflowX: "auto",
                  overflowY: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <BarCharts data={barChartData} />
              </div>
            )}

            {reqSummaryView === "List View" && (
              <div className={styles.summary_request}>
                <Table
                  striped
                  highlightOnHover
                  withTableBorder
                  className={styles.table}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Code</Table.Th>
                      <Table.Th>User Type</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Type</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody className={styles.table_body}>
                    {borrows.map((r) => (
                      <Table.Tr>
                        <Table.Th>{new Date(r.date).toDateString()}</Table.Th>
                        <Table.Th>{r.id}</Table.Th>
                        <Table.Th>{r.user_type}</Table.Th>
                        <Table.Th>
                          {findUser(r.user_type, r.id, users)}
                        </Table.Th>
                        <Table.Th>{r.type}</Table.Th>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <div className={styles.right_container}>
          <div className={styles.charts}>
            <div className={styles.chart1}>
              <div className={styles.header}>
                <h3>Books</h3>
                <NativeSelect
                  radius="xl"
                  data={["User Type", "Year Level", "Department"]}
                  onChange={handleBookPieChart}
                  value={selectedBookPieChart}
                />
              </div>
              <PieCharts data={bookPieChartData} count={bookPieChartCount} />
              <div className={styles.legend}>
                {bookPieChartData.map((item, index) => (
                  <div key={index} className={styles.legendItem}>
                    <span
                      className={styles.legendColor}
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className={styles.legendLabel}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.chart2}>
              <div className={styles.header}>
                <h3>Games</h3>
                <NativeSelect
                  radius="xl"
                  data={["User Type", "Year Level", "Department"]}
                  onChange={handleGamePieChart}
                  value={selectedGamePieChart}
                />
              </div>
              <PieCharts data={gamePieChartData} count={gamePieChartCount} />
              <div className={styles.legend}>
                {gamePieChartData.map((item, index) => (
                  <div key={index} className={styles.legendItem}>
                    <span
                      className={styles.legendColor}
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className={styles.legendLabel}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.summary_container}>
            <div className={styles.summary_header}>
              <h3>Usage Statistics</h3>
              <NativeSelect
                radius="xl"
                data={["Books", "Boardgames"]}
                onChange={handleUsageStatisticsView}
                value={usageStatisticsView}
              />
            </div>

            {usageStatisticsView === "Books" && (
              <div className={styles.summary_usage}>
                <Table
                  striped
                  highlightOnHover
                  withTableBorder
                  className={styles.table}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Book Title</Table.Th>
                      <Table.Th>Total Requests</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody className={styles.table_body}>
                    {bookRCounts.map((r) => (
                      <Table.Tr>
                        <Table.Td>
                          {
                            bookR.find((e) => e.book_id === r.book_id).book
                              .title
                          }
                        </Table.Td>
                        <Table.Td>{r._count.book_id}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            )}

            {usageStatisticsView === "Boardgames" && (
              <div className={styles.summary_usage}>
                <Table
                  striped
                  highlightOnHover
                  withTableBorder
                  className={styles.table}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Game Title</Table.Th>
                      <Table.Th>Total Requests</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody className={styles.table_body}>
                    {gameRCounts.map((r) => (
                      <Table.Tr key={r.boardgame_id}>
                        <Table.Td>
                          {
                            gameR.find((e) => e.boardgame_id === r.boardgame_id)
                              .boardgame.title
                          }
                        </Table.Td>
                        <Table.Td>{r._count.boardgame_id}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </Center>
      <ToastContainer />
    </>
  );
};

export default Reports;
