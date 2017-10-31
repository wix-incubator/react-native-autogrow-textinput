package com.wix.autogrowtextinput;

import android.graphics.Color;
import android.text.Editable;
import android.text.Layout;
import android.text.TextWatcher;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.inputmethod.EditorInfo;
import android.widget.TextView;

import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.views.textinput.ReactEditText;

/**
 * Created by zachik on 14/09/2017.
 */

public class AutoGrowTextInputModule extends ReactContextBaseJavaModule {

    private View mScrollParent;
    private ReactEditText editText;
    private int mTopOffset = 0;
    public AutoGrowTextInputModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AutoGrowTextInputManager";
    }

    @ReactMethod
    public void applySettingsForInput(final Integer tag, ReadableMap param) {
        Log.d("AutoGrow","applySettingsForInput was called on android! tag: " + tag);
        mTopOffset = 0;
        ReactApplicationContext reactContext = this.getReactApplicationContext();
        UIManagerModule uiManager = reactContext.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            public void execute (NativeViewHierarchyManager nvhm) {
                editText = (ReactEditText) nvhm.resolveView(tag);

                findReactRoot(editText).getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
                    @Override
                    public void onGlobalLayout() {
                        Log.d("AutoGrow","onGlobalLayout! view top = " + editText.getTop());
                    }
                });
                editText.setBlurOnSubmit(false);
                editText.setOverScrollMode(View.OVER_SCROLL_NEVER);
                editText.setScrollContainer(false);
                editText.setOnTouchListener(new View.OnTouchListener() {
                    @Override
                    public boolean onTouch(View v, MotionEvent event) {
                        Log.d("AutoGrow","onTouch! canScrollDown = " + v.canScrollVertically(1)
                        + " canScrollUp = " + v.canScrollVertically(-1));
                        v.getParent().requestDisallowInterceptTouchEvent(false);
                        return false;
                    }
                });
                Log.d("AutoGrow","view pad = " + editText.getPaddingTop());

                editText.setBackgroundColor(Color.CYAN);
                editText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
                    @Override
                    public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                        Log.d("AutoGrow","onEditorAction actionId = " + actionId);
                        if ((actionId & EditorInfo.IME_MASK_ACTION) > 0 ||
                                actionId == EditorInfo.IME_NULL) {
                            Log.d("AutoGrow","onEditorAction got enter action!");
                        }
                        return false;
                    }
                });
                editText.addTextChangedListener(mWatcher);

//                editText.addOnLayoutChangeListener(new View.OnLayoutChangeListener() {
//                    @Override
//                    public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
//                        if (mScrollParent == null) {
//                            mScrollParent = findScrollParent(editText);
//                        }
//                        int caretY = getCaretY() + top - mScrollParent.getScrollY();
//                        int offset = caretY - mScrollParent.getBottom();
//
//                        Log.d("AutoGrow","onLayoutChange bottom = " + bottom + " top = " + top);
////                        Log.d("AutoGrow","onLayoutChange scroll = " + mScrollParent.getScrollY());
////                        Log.d("AutoGrow","onLayoutChange caretY = " + caretY);
////                        Log.d("AutoGrow","onLayoutChange parent bottom = " + mScrollParent.getBottom());
//                        if (offset > 0) {
//                            mScrollParent.scrollBy(0,offset);
//                        }
//                    }
//                });
            }
        });
    }

    private void scrollToCaret() {
        if (mScrollParent == null) {
            mScrollParent = findScrollParent(editText);
        }
        int caretY = getCaretY() + mTopOffset - mScrollParent.getScrollY();
        int offset = caretY - mScrollParent.getBottom();

//                        Log.d("AutoGrow","onLayoutChange scroll = " + mScrollParent.getScrollY());
//                        Log.d("AutoGrow","onLayoutChange caretY = " + caretY);
//                        Log.d("AutoGrow","onLayoutChange parent bottom = " + mScrollParent.getBottom());
        if (offset > 0) {
            mScrollParent.scrollBy(0,offset);
        }
    }

    private ReactRootView findReactRoot(View v) {
        while (v.getParent() != null) {
            if (v instanceof ReactRootView) {
                Log.d("AutoGrow","has root");
                return (ReactRootView) v;
            }
            v = (View) v.getParent();
        }
        Log.d("AutoGrow","no root");
        return null;
    }
    private View findScrollParent(View v) {
        mTopOffset += v.getTop();
        while (v.getParent() != null) {
            v = (View) v.getParent();

            Log.d("AutoGrow","has parent. top = " + v.getTop() + " pad = " + v.getPaddingTop());
            if (v.isScrollContainer()) {
                Log.d("AutoGrow","has scroll parent. bottom = " + v.getBottom() + " pad = " + v.getPaddingTop());
                return v;
            }
            mTopOffset += v.getTop();
        }
        Log.d("AutoGrow","no scroll parent");
        return null;
    }
    private int getCaretY() {
        int pos = editText.getSelectionStart();
        Layout layout = editText.getLayout();
        int line = layout.getLineForOffset(pos);
        int baseline = layout.getLineBaseline(line);
//        int ascent = layout.getLineAscent(line);
//        float y = baseline + ascent;
        int padBottom = 20;
        return baseline + editText.getPaddingTop() + padBottom;
    }
    @ReactMethod
    public void performCleanupForInput(Integer tag) {
        Log.d("AutoGrow","performCleanupForInput was called on android! tag: " + tag);
        mScrollParent = null;
    }

    private TextWatcher mWatcher = new TextWatcher() {
        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) {

        }

        @Override
        public void onTextChanged(CharSequence s, int start, int before, int count) {
            scrollToCaret();
        }

        @Override
        public void afterTextChanged(Editable s) {

        }
    };
}
