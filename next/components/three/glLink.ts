/**
 * Resolves once a linked WebGL program is ready, without blocking: with
 * KHR_parallel_shader_compile the driver links in the background and we poll
 * its completion flag; reading LINK_STATUS straight away would stall the main
 * thread until the link finishes (hundreds of ms on some GPUs at page load).
 */
export function whenLinked(gl: WebGLRenderingContext, prog: WebGLProgram): Promise<boolean> {
  const ext = gl.getExtension('KHR_parallel_shader_compile');
  return new Promise((resolve) => {
    const check = () => {
      if (ext && !gl.getProgramParameter(prog, ext.COMPLETION_STATUS_KHR)) {
        window.setTimeout(check, 16);
        return;
      }
      resolve(Boolean(gl.getProgramParameter(prog, gl.LINK_STATUS)));
    };
    check();
  });
}
