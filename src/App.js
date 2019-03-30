import React, { Component } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { openDB } from 'idb'; //, deleteDB, wrap, unwrap 
import {config} from '../config'
const arAea = ["اختر", "مكة", "عسير", "الجوف", "الرياض", "الشمالية", "الباحة", "المدينة", "حائل", "نجران", "القصيم", "تبوك", "الشرقية", "جازان"];
const groups = ["اختر", "آل آمزغلول", "آل السعيدي", "آل سمينة", "آل سالم بن هازم", "آل عاطف", "آل علي بن سويد", "آل يعلى", "آل ذمسوده", "صدر حسوة", "صدرة قيس", "البتيلة", "الذروة", "الربع", "الرحوب", "سرو المرار", "الصحبة", "المجرعة", "المسابلة"];
class App extends Component {
  state = { orgData: null, filterToMatch: '', filter: null };
  async  getRemote() {
   

    firebase.initializeApp(config);
    // firebase.auth().onAuthStateChanged(user => {if(async (user)){
    firebase.auth().signInWithEmailAndPassword("assiri@hotmail.com", "ibra8374").then(async (user) => {
      const snapshot = await firebase.firestore().collection('members').get()
      const db = await snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      for (let rec of db) {
        rec.name = `${rec.fname.trim()} ${rec.sname.trim()} ${rec.tname.trim()} ${rec.lname.trim()}`;
        delete rec.fname;
        delete rec.sname;
        delete rec.tname;
        delete rec.lname;
        delete rec.owner;
        await this.dbPromise.put("qdata", rec);
      }
      this.orgData = db;
      this.setState({ orgData: db });
    });
  }
  filterToMatchHnndler = (ev) => {
    this.setState({ filterToMatch: ev.target.value.trim() });
  }
  search = () => {
    if (this.state.filter === 'all') {
      this.filterToMatch = '';
      this.setState({ orgData: this.orgData })
      return;
    }
    const regex = new RegExp(this.state.filterToMatch, 'gi');
    const result = this.orgData.filter(rec => {
      return String(rec[this.state.filter]).match(regex)
    });
    this.setState({ orgData: result })
  }
  selectChange = (ev) => {
    this.setState({ filter: ev.target.value })
  }
  async componentWillMount() {
    this.dbPromise = await openDB('qaisdata', 1, { upgrade(db) { db.createObjectStore('qdata', { keyPath: 'id' }); } });
    this.orgData = await this.dbPromise.transaction("qdata", 'readonly').objectStore("qdata").getAll();
    if (this.orgData.length === 0) {
      await this.getRemote();
      this.setState({ orgData: this.orgData })
    } else {
      this.setState({ orgData: this.orgData })
    }
  }

  inputField = () => {
    if (this.state.filter === 'mobile' || this.state.filter === 'said' || this.state.filter === 'name') {
      return (<input type="text" className="form-control" placeholder="ادخل النص المراد البحث عنه" onChange={this.filterToMatchHnndler} value={this.filterToMatch} />)
    } else if (this.state.filter === 'group') {
      return (<select placeholder="اختر العشيره" className="form-control" onChange={this.filterToMatchHnndler}>
        {groups.map((g, i) => <option key={i} value={g}>{g}</option>)}
      </select>)
    } else if (this.state.filter === 'area') {
      return (<select placeholder="اختر المنطقة" className="form-control" onChange={this.filterToMatchHnndler}>
        {arAea.map((ar, i) => <option key={i} value={ar}>{ar}</option>)}
      </select>)
    } else {
      return null;
    }
  }

  render() {
    return (<div className="container rtl">
      <div className="row">
        <div className="col-12 col-sm-4 p-1">
          <select placeholder="أختر طريقة البحث" className="form-control" onChange={this.selectChange}>
            <option value="all">الكل</option>
            <option value="mobile">البحث برقم الجوال</option>
            <option value="said">البحث برقم الهوية</option>
            <option value="name">البحث بالأسم</option>
            <option value="area">البحث بالمنطقة</option>
            <option value="group">البحث بالعشيره</option>
          </select>
        </div>
        <div className="form-group col-12 col-sm-5 p-1">
          <div className="input-group">
            {this.inputField()}
            <button type="button" className="btn btn-dark" onClick={this.search}> بحث </button>
          </div>
        </div>
        <div className="col-12 col-sm-3 p-1">
          <button type="button" className="btn btn-secondary btn-lg btn-block">اجمالي عدد السجلات : <span className="badge badge-secondary">{this.state.orgData ? `${this.state.orgData.length}` : 'لا توجد بيانات'} </span></button>
          <button type="button" className="btn btn-secondary btn-lg btn-block">إجمالي افراد الاسر : <span className="badge badge-secondary">{this.state.orgData && this.state.orgData.reduce((t, s) => { return t += s.familyCount }, 0)}</span></button>
        </div>
        <div className="table-responsive rtl p-1">
          <table className="table">
            <thead>
              <tr className="d-flex">
                <th className="col-5 col-sm-3">الاسم</th>
                <th className="col-4 col-sm-3">الجوال</th>
                <th className="col-2 d-none d-md-block">بطاقة الاحوال</th>
                <th className="col-2 d-none d-md-block">المنطقة</th>
                <th className="col-2 d-none d-md-block">العشيرة</th>
                <th className="col-2 col-sm-1">العدد</th>
              </tr>
            </thead>
            <tbody>
              {this.state.orgData && this.state.orgData.length > 0 ? this.state.orgData.map(rec => (
                <tr className="d-flex" key={rec.id}>
                  <td className="col-5 col-sm-3">{rec.name}</td>
                  <td className="col-4 col-sm-2">{rec.mobile}</td>
                  <td className="col-2 d-none d-md-block">{rec.said}</td>
                  <td className="col-2 d-none d-md-block">{rec.area}</td>
                  <td className="col-2 d-none d-md-block">{rec.group}</td>
                  <td className="col-1 col-sm-1">{rec.familyCount}</td>
                </tr>
              )) : <tr className="text-center"><td rowSpan="4">لا توجد نتائج حسب البحث</td></tr>}
            </tbody>
          </table>
        </div>
      </div >
    </div >)
  }
}
export default App;