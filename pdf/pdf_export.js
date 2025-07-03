import pdfkit from "pdfkit";
import fs from "node:fs";
import { format_date, format_time, get_charge } from "../client/src/assets/util.js";
import path from "node:path";
const __dirname = path.resolve(path.dirname(''));

const TIMES = path.resolve(__dirname, "pdf", "times.ttf");
const TIMES_BI = path.resolve(__dirname, "pdf", "timesbi.ttf");
const COMIC = path.resolve(__dirname, "pdf", "comic.ttf");
const QR_CODE = path.resolve(__dirname, "pdf", "PayPal.JPG");
const MAX_ROWS = 10;
const OUTFILE = path.resolve(__dirname, "pdf", "invoice.pdf");

const format_data = (data, headers) => {
    let rows = [];
    let total = 0;

    rows.push(headers);
    for (let i = 0; i < data.length && i < MAX_ROWS; i++) {
        const in_time = new Date(data[i].in_time);
        const out_time = new Date(data[i].out_time);

        let delta = out_time - in_time;
        let charge = get_charge(in_time, out_time-1000, data[i].rate); // Subtract 1 second from out_time to prevent rounding errors
        let delta_str = `${Math.floor(delta/3600000)}:${Math.floor((delta%3600000)/60000).toString().padEnd(2, "0")}`;

        let row = [
            format_date(data[i].in_time),
            format_time(data[i].in_time), // Might need to format
            format_time(data[i].out_time), // Might need to format
            delta_str, // Calculate?
            data[i].rate.toLocaleString("en-US", { style: "currency", currency: "USD" }),
            charge.toLocaleString("en-US", { style: "currency", currency: "USD" }), // Calculate?
        ];
        total += charge;
        rows.push(row);
    }

    // Pad with blanks
    for (let i = 0; i < MAX_ROWS - data.length - 1; i++) {
        rows.push(["", "", "", "", "", ""]);
    }

    // Grand Total
    rows.push([
        "",
        "",
        "",
        "",
        "Grand Total",
        total.toLocaleString("en-US", { style: "currency", currency: "USD" }),
    ]);

    // console.log(rows);
    return rows;
};

export const export_pdf = async (student, sessions) => {
    const student_name = `${student.fname} ${student.lname}`;
    const start_date = sessions[0].in_time;
    const end_date = sessions[sessions.length-1].in_time;
    const num_sessions = sessions.length;

    const headers = ["Date", "Time In", "Time Out", "Duration", "Hourly Rate", "Charge"];

    const doc = new pdfkit({ size: [612, 396], margin: "0.25in" });

    //** Header
    doc.font(TIMES_BI).fontSize(25).text("Invoice", 36, 20);

    //** Student Info -- Separate dates with an endash
    doc.font(TIMES)
        .fontSize(14)
        .text(
            `Student: ${student_name}\nPeriod: ${format_date(start_date)}\u2013${format_date(end_date)}\nClasses: ${num_sessions}`,
            36,
            60
        );

    //** Business Info
    doc.font(COMIC).fontSize(16).text("Vasudha NR Tutoring Services", 300, 20, {
        align: "right",
    });

    // QR Code, label, and Box
    doc.fontSize(12);
    doc.image(QR_CODE, 525, 46, { width: 60 }).fillColor("blue").text(
        "@VasudhaRamanarasiah",
        445,
        105,
        {
            align: "center",
            link: "https://paypal.me/VasudhaRamanarasiah",
            fillColor: "blue",
            underline: true,
        }
    );

    doc.fillColor("black").text("Pay with\nPayPal\u00AE", 455, 50);
    doc.rect(440, 45, 154, 80).stroke();

    //** Table of classes
    const table_data = format_data(sessions, headers);
    doc.font(TIMES).fontSize(14);
    doc.table({
        defaultStyle: { textAlign: "center" },
        rowStyles: (i) => {
            if (i === 0) {
                return { border: { top: 1, bottom: 1 }, minHeight: 20 };
            } else if (i <= sessions.length) {
                return { border: { top: 0, bottom: 1 }, minHeight: 20 };
            } else if (i === table_data.length - 1) {
                return { border: { top: 1, bottom: 1 }, minHeight: 20, backgroundColor: "#DDD" };
            } else {
                return { border: { top: 0, bottom: 0 }, minHeight: 20 };
            }
        },
        columnStyles: (i) => {
            if (i === 0) {
                return { border: { left: 1, right: 0 } };
            } else if (i === table_data[0].length - 1) {
                return { border: { left: 0, right: 1 } };
            } else {
                return { border: { left: 0, right: 0 } };
            }
        },
        data: table_data,
        position: { x: 36, y: 125 },
        textOptions: { align: "center" },
    });

    doc.end();
    doc.pipe(fs.createWriteStream(OUTFILE));
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("done");
        }, 100)
    });
};

// const stu = { fname: "Pranav", lname: "Rao" };

// From earliest to latest
// const s = [
//     {
//         in_time: new Date(1749672000000),
//         out_time: new Date(1749675600000),
//         rate: 65.0,
//     },
//     {
//         in_time: new Date(1750017600000),
//         out_time: new Date(1750021200000),
//         rate: 65.0,
//     },
// ];
// const res = await export_pdf(stu, s);
// console.log(res);
