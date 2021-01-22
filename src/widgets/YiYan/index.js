import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import ErrorTip from '../Common/ErrorTip';
import Loading from '../Common/Loading';
import Setting from './Setting';
import Icon from './Icon';
import { CateMap } from './const';

const StyledWrapper = styled.section`
  position: relative;

  height: 100%;
  /* background-color: ; */
  background: url('https://gitee.com/zyanggc/oss/raw/master/works/widget.yiyan.bg.jpg') no-repeat;
  background-size: cover;
  background-position: bottom;
  .yiyan {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 0.1rem;
    padding: 0.25rem;
    background-color: rgba(2, 2, 2, 0.6);
    border-radius: 5px;
    color: #fff;
    width: 100%;
    height: 100%;
    .content {
      font-size: 0.3rem;
      font-weight: 800;
      line-height: 1.5;
      margin-bottom: 0.08rem;
    }
    .footer {
      color: #eee;
      font-size: 0.15rem;
      margin-bottom: 0.12rem;
      align-self: flex-end;
    }
    .lines {
      display: flex;
      flex-direction: column;
      align-items: center;
      .line {
        font-size: 0.16rem;
        line-height: 1.5;
        margin-bottom: 0.05rem;
        &.famous {
          font-weight: 800;
        }
      }
    }
  }
`;
const WIDGET_LOCAL_YIYAN_KEY = 'WIDGET_YIYAN_LOCAL';
const localData = localStorage.getItem(WIDGET_LOCAL_YIYAN_KEY) || 'null';
try {
  let tmp = JSON.parse(localData);
  // 检查下是否是同一天
  if (tmp.storedate != new Date().toDateString()) {
    localStorage.setItem(WIDGET_LOCAL_YIYAN_KEY, 'null');
  }
} catch (error) {
  localStorage.setItem(WIDGET_LOCAL_YIYAN_KEY, 'null');
}
let InterInt = 0;
export default function YiYan() {
  const innerLocalData = localStorage.getItem(WIDGET_LOCAL_YIYAN_KEY) || 'null';
  const localYiyan = JSON.parse(innerLocalData) || null;
  const [yiyan, setYiyan] = useState(localYiyan);
  const [currCates, setCurrCates] = useState(Object.keys(CateMap));
  const [inter, setInter] = useState(0);
  const [loading, setLoading] = useState(!localYiyan);
  const [errTip, setErrTip] = useState('');
  const getYiYan = useCallback(async () => {
    let catesStr = currCates
      .map((cate) => {
        return `c=${cate}`;
      })
      .join('&');
    try {
      const list = await fetch(`https://v1.hitokoto.cn/?${catesStr}&encode=json`);
      const resp = (await list.json()) || null;
      localStorage.setItem(
        WIDGET_LOCAL_YIYAN_KEY,
        JSON.stringify({ ...resp, storedate: new Date().toDateString() })
      );
      setYiyan(resp);
      setLoading(false);
    } catch (error) {
      setErrTip('出错了~');
      return;
    }
  }, [currCates]);
  useEffect(() => {
    if (!yiyan) {
      // 先清除间隔计时
      clearInterval(InterInt);
      getYiYan();
    }
  }, [yiyan]);
  useEffect(() => {
    if (inter != 0) {
      InterInt = setInterval(() => {
        getYiYan();
      }, inter * 1000);
    }
    return () => {
      clearInterval(InterInt);
    };
  }, [inter, getYiYan]);
  if (loading) return <Loading />;
  if (errTip) return <ErrorTip tip={errTip} />;
  const { hitokoto, from_who, from } = yiyan;
  return (
    <StyledWrapper>
      <Setting
        currCates={currCates}
        updateCurrCates={setCurrCates}
        currInter={inter}
        updateInter={setInter}
      />
      <article className="yiyan">
        <p className="content">{hitokoto}</p>
        <footer className="footer">
          -- {from_who || '来自'}·{from}
        </footer>
      </article>
      <Icon className="refresh" onClick={getYiYan}>
        换
      </Icon>
    </StyledWrapper>
  );
}
