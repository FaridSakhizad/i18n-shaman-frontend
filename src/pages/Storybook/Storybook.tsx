import React from 'react';

import './Storybook.scss';

export default function Storybook() {
  return (
    <div className="storybook">
      <h1>Storybook</h1>
      <hr />

      <form className="formMk1">
        <div className="formMk1-row">
          <div className="formControl">
            <div className="formControl-header">
              <label className="formControl-label" htmlFor="storybook-email">Email</label>
            </div>
            <div className="formControl-body">
              <div className="formControl-wrapper">
                <input id="storybook-email" className="input formControl-input" />
              </div>
            </div>
            <div className="formControl-footer" />
          </div>
        </div>

        <div className="formMk1-row">
          <div className="formControl">
            <div className="formControl-header">
              <label className="formControl-label" htmlFor="storybook-password">Password</label>
            </div>
            <div className="formControl-body">
              <div className="formControl-wrapper">
                <i className="formControl-iconStart formControl-iconKey" />
                <i className="formControl-iconEnd formControl-iconEye" />
                <input id="storybook-password" className="input formControl-input" />
              </div>
            </div>
            <div className="formControl-footer" />
          </div>
        </div>

        <div className="formMk1-row">
          <div className="formControl hasError">
            <div className="formControl-header">
              <label className="formControl-label" htmlFor="storybook-first-name">First Name*</label>
              <i className="formControl-infoIcon" />
            </div>
            <div className="formControl-body">
              <div className="formControl-wrapper">
                <input id="storybook-first-name" type="text" className="input formControl-input" />
              </div>
            </div>
            <div className="formControl-footer">
              <div className="formControl-noteBox">
                <span className="formControl-noteStart">Please no markdown</span>
                <span className="formControl-noteEnd">1024 Symbols left</span>
              </div>
              <div className="formControl-error">Please Enter Your Name</div>
            </div>
          </div>
        </div>

        <div className="formMk1-row">
          <div className="formControl">
            <div className="formControl-header">
              <label className="formControl-label" htmlFor="storybook-second-name">Second Name* <i className="formControl-infoIcon" /></label>
            </div>
            <div className="formControl-body">
              <div className="formControl-wrapper">
                <input id="storybook-second-name" type="text" className="input formControl-input" />
              </div>
            </div>
          </div>
        </div>

        <div className="formMk1-row">
          <div className="formControl">
            <div className="formControl-header">
              <label className="formControl-label" htmlFor="storybook-about">About yourself</label>
            </div>
            <div className="formControl-body">
              <div className="formControl-wrapper">
                <textarea id="storybook-about" className="textarea formControl-textarea" />
              </div>
            </div>
            <div className="formControl-footer">
              <div className="formControl-noteBox">
                <span className="formControl-noteStart">Please no markdown</span>
                <span className="formControl-noteEnd">1024 Symbols left</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      <hr />

      <input type="checkbox" className="switcher" />

      <hr />

      <label className="checkboxControl">
        <input type="checkbox" className="checkbox" />
        <span className="checkboxControl-text">Checkbox + Label</span>
      </label>

      <hr />

      <label className="radioControl">
        <input type="radio" className="radio" name="radio-1" />
        <span className="radioControl-text">Radio + Label</span>
      </label>
      <br />
      <label className="radioControl">
        <input type="radio" className="radio" name="radio-1" />
        <span className="radioControl-text">Radio + Label</span>
      </label>
      <br />
      <label className="radioControl">
        <input type="radio" className="radio" name="radio-1" />
        <span className="radioControl-text">Radio + Label</span>
      </label>
      <br />
      <label className="radioControl">
        <input type="radio" className="radio" name="radio-1" />
        <span className="radioControl-text">Radio + Label</span>
      </label>
    </div>
  );
}
