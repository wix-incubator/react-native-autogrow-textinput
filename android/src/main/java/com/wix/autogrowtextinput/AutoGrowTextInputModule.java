package com.wix.autogrowtextinput;

import android.text.Editable;
import android.text.Layout;
import android.text.TextWatcher;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.widget.TextView;
import android.content.Context;

import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.views.textinput.ReactEditText;
import android.view.inputmethod.InputMethodManager;

/**
 * Created by zachik on 14/09/2017.
 */

public class AutoGrowTextInputModule extends ReactContextBaseJavaModule {

    private View mScrollParent;
    private ReactEditText editText;
    private int mTopOffset = 0;
    private int mMaxHeight = Integer.MAX_VALUE;
    private boolean mHasScrollParent = false;
    public AutoGrowTextInputModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AutoGrowTextInputManager";
    }

    @ReactMethod
    public void applySettingsForInput(final Integer tag,final ReadableMap param) {

        mTopOffset = 0;
        ReactApplicationContext reactContext = this.getReactApplicationContext();
        UIManagerModule uiManager = reactContext.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            public void execute (NativeViewHierarchyManager nvhm) {
                editText = (ReactEditText) nvhm.resolveView(tag);
                if (param.hasKey("maxHeight") && !param.isNull("maxHeight")) {
                    mMaxHeight = dpToPx(param.getDouble("maxHeight"));
                }
                editText.setBlurOnSubmit(false);
                editText.setOnTouchListener(new View.OnTouchListener() {
                    @Override
                    public boolean onTouch(View v, MotionEvent event) {

                        v.getParent().requestDisallowInterceptTouchEvent(false);
                        return false;
                    }
                });

                editText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
                    @Override
                    public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                        return false;
                    }
                });

                if (param.hasKey("enableScrollToCaret") && param.getBoolean("enableScrollToCaret")) {
                    editText.addTextChangedListener(mWatcher);
                }

            }
        });
    }

    private int dpToPx(double dp) {
        return (int) (dp * editText.getResources().getDisplayMetrics().density);
    }

    private void scrollToCaret() {
        if (mScrollParent == null) {

                mScrollParent = findScrollParent(editText);

        }
        boolean isAtMaxHeight = mScrollParent.getHeight() >= mMaxHeight;
        if (mHasScrollParent || isAtMaxHeight) {
            int caretY = getCaretY() + mTopOffset - mScrollParent.getScrollY();
            int offset = caretY - mScrollParent.getHeight();
            if (offset > 0 || isAtMaxHeight) {
                offset = Math.max(offset,-mScrollParent.getScrollY());
                mScrollParent.scrollBy(0, offset);
            }
        }
    }

    private ReactRootView findReactRoot(View v) {
        while (v.getParent() != null) {
            if (v instanceof ReactRootView) {
                return (ReactRootView) v;
            }
            v = (View) v.getParent();
        }

        return null;
    }
    private View findScrollParent(View v) {
        mTopOffset = v.getTop();
        while (v.getParent() != null && v.getParent() instanceof View) {
            v = (View) v.getParent();

            if (v.isScrollContainer()) {
                mHasScrollParent = true;
                return v;
            }
            mTopOffset += v.getTop();
        }
        mTopOffset = 0;
        return editText;
    }
    private int getCaretY() {
        int pos = editText.getSelectionStart();
        Layout layout = editText.getLayout();
        int line = layout.getLineForOffset(pos);
        int baseline = layout.getLineBaseline(line);
        int padBottom = editText.getPaddingBottom() + dpToPx(5f);
        return baseline + editText.getPaddingTop() + padBottom;
    }
    @ReactMethod
    public void performCleanupForInput(Integer tag) {
        mScrollParent = null;
    }

    private TextWatcher mWatcher = new TextWatcher() {
        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

        @Override
        public void onTextChanged(CharSequence s, int start, int before, int count) {}

        @Override
        public void afterTextChanged(Editable s) {
            scrollToCaret();
        }
    };


    // Props to https://github.com/MattFoley for this temporary hack
    // https://github.com/facebook/react-native/pull/12462#issuecomment-298812731
    @ReactMethod
    public void resetKeyboardInput(final int reactTagToReset) {
        UIManagerModule uiManager = getReactApplicationContext().getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new UIBlock() {
            @Override
            public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                InputMethodManager imm = (InputMethodManager) getReactApplicationContext().getBaseContext().getSystemService(Context.INPUT_METHOD_SERVICE);
                if (imm != null) {
                    View viewToReset = nativeViewHierarchyManager.resolveView(reactTagToReset);
                    imm.restartInput(viewToReset);
                }
            }
        });
    }


}
