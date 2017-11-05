import { Component } from 'react'
import Head from 'next/head'
import * as systemFontStack from 'system-font-stack'

export default class IndexPage extends Component {
  render() {
    return (
      <div>
        <style jsx global>{`
          body {
            font-family: ${systemFontStack};
          }
        `}</style>
        <Head>
          <title>scrollIntoViewIfNeeded test page</title>
        </Head>

        <h1>scrollIntoViewIfNeeded test page</h1>
        <style jsx>{`
          ul {
            border: 1px solid #aaa;
            height: 7em;
            margin: 0;
            overflow: auto;
            padding: 0;
            width: 400px;
            white-space: nowrap;
          }

          ul li {
            background: #eee;
            border-radius: 5px;
            display: inline-block;
            list-style: none;
            padding: 5px 10px;
          }

          ul li:nth-child(2n + 1) {
            background: #ddd;
            text-align: right;
          }

          ul li.selected {
            background: #bada55;
          }
        `}</style>
        <ul>
          <li className="selected">item #0</li>
          <li>item #1</li>
          <li>item #2</li>
          <li>item #3</li>
          <li>item #4</li>
          <li>item #5</li>
          <li>item #6</li>
          <li>item #7</li>
          <li>item #8</li>
          <li>item #9</li>
          <li>item #10</li>
          <li>item #11</li>
          <li>item #12</li>
          <li>item #13</li>
          <li>item #14</li>
          <li>item #15</li>
          <li>item #16</li>
          <li>item #17</li>
          <li>item #18</li>
          <li>item #19</li>
          <li>item #20</li>
          <li>item #21</li>
          <li>item #22</li>
          <li>item #23</li>
          <li>item #24</li>
          <li>item #25</li>
          <li>item #26</li>
          <li>item #27</li>
          <li>item #28</li>
          <li>item #29</li>
          <li>item #30</li>
          <li>item #31</li>
          <li>item #32</li>
          <li>item #33</li>
          <li>item #34</li>
          <li>item #35</li>
          <li>item #36</li>
          <li>item #37</li>
          <li>item #38</li>
          <li>item #39</li>
          <li>item #40</li>
          <li>item #41</li>
          <li>item #42</li>
          <li>item #43</li>
          <li>item #44</li>
          <li>item #45</li>
          <li>item #46</li>
          <li>item #47</li>
          <li>item #48</li>
          <li>item #49</li>
          <li>item #50</li>
          <li>item #51</li>
          <li>item #52</li>
          <li>item #53</li>
          <li>item #54</li>
          <li>item #55</li>
          <li>item #56</li>
          <li>item #57</li>
          <li>item #58</li>
          <li>item #59</li>
          <li>item #60</li>
          <li>item #61</li>
          <li>item #62</li>
          <li>item #63</li>
          <li>item #64</li>
          <li>item #65</li>
          <li>item #66</li>
          <li>item #67</li>
          <li>item #68</li>
          <li>item #69</li>
          <li>item #70</li>
          <li>item #71</li>
          <li>item #72</li>
          <li>item #73</li>
          <li>item #74</li>
          <li>item #75</li>
          <li>item #76</li>
          <li>item #77</li>
          <li>item #78</li>
          <li>item #79</li>
          <li>item #80</li>
          <li>item #81</li>
          <li>item #82</li>
          <li>item #83</li>
          <li>item #84</li>
          <li>item #85</li>
          <li>item #86</li>
          <li>item #87</li>
          <li>item #88</li>
          <li>item #89</li>
          <li>item #90</li>
          <li>item #91</li>
          <li>item #92</li>
          <li>item #93</li>
          <li>item #94</li>
          <li>item #95</li>
          <li>item #96</li>
          <li>item #97</li>
          <li>item #98</li>
          <li>item #99</li>
        </ul>

        <div id="buttons-centerFalse">
          <span>
            <code>scrollIntoViewIfNeeded(false)</code> to item :{' '}
          </span>
          <button data-item-idx="0">#0</button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <div id="buttons-centerTrue">
          <span>
            <code>scrollIntoViewIfNeeded(true)</code> to item :{' '}
          </span>
          <button data-item-idx="0">#0</button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <div id="buttons-centerUndefined">
          <span>
            <code>scrollIntoViewIfNeeded(undefined)</code> to item :{' '}
          </span>
          <button data-item-idx="0">#0</button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <div id="buttons-centerNoArgs">
          <span>
            <code>scrollIntoViewIfNeeded()</code> to item :{' '}
          </span>
          <button data-item-idx="0">#0</button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <div id="buttons-animate">
          <span>
            <code>animate scrollIntoViewIfNeeded()</code> to item :{' '}
          </span>
          <button data-item-idx="0">#0</button>
          <button data-item-idx="11">#11</button>
          <button data-item-idx="22">#22</button>
          <button data-item-idx="24">#24</button>
          <button data-item-idx="26">#26</button>
          <button data-item-idx="33">#33</button>
          <button data-item-idx="44">#44</button>
          <button data-item-idx="55">#55</button>
          <button data-item-idx="66">#66</button>
          <button data-item-idx="77">#77</button>
          <button data-item-idx="82">#82</button>
          <button data-item-idx="84">#84</button>
          <button data-item-idx="86">#86</button>
          <button data-item-idx="99">#99</button>
        </div>

        <script type="text/html">{`
        (function() {
            var scrollArea = document.getElementById('scroll-area'),
                buttonsCenterFalse = document.getElementById('buttons-centerFalse'),
                buttonsCenterTrue = document.getElementById('buttons-centerTrue'),
                buttonsCenterUndefined = document.getElementById('buttons-centerUndefined'),
                buttonsCenterNoArgs = document.getElementById('buttons-centerNoArgs'),
                buttonsAnimate = document.getElementById('buttons-animate'),
                scrollIntoViewIfNeededToItemAndSelect;
            scrollIntoViewIfNeededToItemAndSelect = function(itemIdx, centerIfNeeded, options) {
                scrollArea.querySelector('.selected').className = '';
                // Allow us to really have difference bewteen scrollIntoViewIfNeeded() and scrollIntoViewIfNeeded(undefined)
                if (arguments.length === 1) {
                    scrollIntoViewIfNeeded(scrollArea.children[itemIdx]);
                } else {
                    scrollIntoViewIfNeeded(scrollArea.children[itemIdx], centerIfNeeded, options);
                }
                scrollArea.children[itemIdx].className = 'selected';
            };
            buttonsCenterFalse.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx, false);
                }
            }, false);
            buttonsCenterTrue.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx, true);
                }
            }, false);
            buttonsCenterUndefined.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx, undefined);
                }
            }, false);
            buttonsCenterNoArgs.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx);
                }
            }, false);
            buttonsAnimate.addEventListener('click', function(e) {
                if (e.target.nodeName === 'BUTTON') {
                    scrollIntoViewIfNeededToItemAndSelect(e.target.dataset.itemIdx, false, {
                        centerIfNeeded: false,
                        duration: 150
                    });
                }
            }, false);
        })();
    `}</script>
      </div>
    )
  }
}
